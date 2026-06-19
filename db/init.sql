-- ============================================================
-- RAFIQ EXECUTIVE ASSISTANT — PostgreSQL Schema
-- قاعدة بيانات المساعد الذكي التنفيذي لمنصة الرفيق
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text Arabic search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE service_type_enum AS ENUM (
  'hotel',        -- فندق
  'restaurant',   -- مطعم تقليدي
  'rental',       -- كراء سياحي
  'transport'     -- نقل
);

CREATE TYPE booking_status_enum AS ENUM (
  'pending',      -- في الانتظار
  'confirmed',    -- مؤكد
  'paid',         -- مدفوع
  'cancelled',    -- ملغى
  'completed',    -- مكتمل
  'refunded'      -- مُسترد
);

CREATE TYPE pay_status_enum AS ENUM (
  'pending',      -- في الانتظار
  'processing',   -- قيد المعالجة
  'success',      -- ناجح
  'failed',       -- فاشل
  'refunded'      -- مُسترد
);

CREATE TYPE region_enum AS ENUM (
  'شمال',         -- الشمال
  'هضاب_عليا',   -- الهضاب العليا
  'جنوب'          -- الجنوب
);

-- ============================================================
-- TABLE: wilayas (58 ولاية جزائرية)
-- ============================================================
CREATE TABLE wilayas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        SMALLINT UNIQUE NOT NULL CHECK (code BETWEEN 1 AND 58),
  name_ar     VARCHAR(100) NOT NULL,
  name_fr     VARCHAR(100) NOT NULL,
  region      region_enum NOT NULL,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: users (عملاء المنصة)
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(20) UNIQUE NOT NULL,
  full_name     VARCHAR(200),
  email         VARCHAR(200),
  wilaya_id     UUID REFERENCES wilayas(id) ON DELETE SET NULL,
  loyalty_pts   INTEGER DEFAULT 0 CHECK (loyalty_pts >= 0),
  loyalty_tier  VARCHAR(20) DEFAULT 'bronze',  -- bronze, silver, gold, platinum
  total_spent   DECIMAL(14,2) DEFAULT 0.00,
  bookings_count INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: service_providers (مزودو الخدمات)
-- ============================================================
CREATE TABLE service_providers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar     VARCHAR(200) NOT NULL,
  name_fr     VARCHAR(200),
  type        service_type_enum NOT NULL,
  wilaya_id   UUID REFERENCES wilayas(id) ON DELETE CASCADE,
  phone       VARCHAR(20),
  address     TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  commission_pct DECIMAL(5,2) DEFAULT 10.00,  -- نسبة عمولة المنصة
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: services (الخدمات المتاحة)
-- ============================================================
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  type            service_type_enum NOT NULL,
  name_ar         VARCHAR(200) NOT NULL,
  name_fr         VARCHAR(200),
  wilaya_id       UUID REFERENCES wilayas(id) ON DELETE CASCADE,
  description_ar  TEXT,
  price_dzd       DECIMAL(12,2) NOT NULL CHECK (price_dzd > 0),
  price_unit      VARCHAR(50) DEFAULT 'per_night',  -- per_night, per_person, per_km
  capacity        INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  rating          DECIMAL(3,2) DEFAULT 0.00,
  total_bookings  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: bookings (الحجوزات — الجدول الرئيسي)
-- ============================================================
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref     VARCHAR(20) UNIQUE NOT NULL,  -- REF-YYYYMMDD-XXXXX
  user_id         UUID REFERENCES users(id) ON DELETE RESTRICT,
  service_id      UUID REFERENCES services(id) ON DELETE RESTRICT,
  wilaya_id       UUID REFERENCES wilayas(id) ON DELETE RESTRICT,  -- للفهرسة الجغرافية
  booking_status  booking_status_enum DEFAULT 'pending',
  check_in        DATE NOT NULL,
  check_out       DATE,
  guests_count    INTEGER DEFAULT 1,
  total_dzd       DECIMAL(12,2) NOT NULL CHECK (total_dzd > 0),
  commission_dzd  DECIMAL(12,2) DEFAULT 0.00,   -- عمولة المنصة
  notes           TEXT,
  source          VARCHAR(50) DEFAULT 'platform',  -- platform, whatsapp, manual
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: transactions (المعاملات المالية بالدينار الجزائري)
-- ============================================================
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID REFERENCES bookings(id) ON DELETE RESTRICT,
  amount_dzd      DECIMAL(12,2) NOT NULL CHECK (amount_dzd > 0),
  cib_ref         VARCHAR(100) UNIQUE,          -- مرجع بنك CIB
  cib_order_id    VARCHAR(100),
  cib_payload     JSONB,                         -- البيانات الكاملة من CIB
  payment_method  VARCHAR(50) DEFAULT 'CIB',
  status          pay_status_enum DEFAULT 'pending',
  invoice_number  VARCHAR(30) UNIQUE,            -- INV-YYYY-XXXXXXX
  invoice_pdf_url VARCHAR(500),
  paid_at         TIMESTAMPTZ,
  failed_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: alerts (تنبيهات نظام n8n للمدير)
-- ============================================================
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        VARCHAR(50) NOT NULL,   -- geo_pressure, loyalty, payment_fail, system
  title_ar    VARCHAR(200) NOT NULL,
  body_ar     TEXT,
  severity    VARCHAR(20) DEFAULT 'info',  -- info, warning, critical
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB,                   -- بيانات إضافية (wilaya_id, user_id...)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: loyalty_history (سجل نقاط الولاء)
-- ============================================================
CREATE TABLE loyalty_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE,
  pts_earned  INTEGER NOT NULL,
  pts_balance INTEGER NOT NULL,
  reason      VARCHAR(200),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STRATEGIC INDEXES (فهارس الأداء الاستراتيجية)
-- ============================================================

-- الفهارس الجغرافية للاستعلامات اللحظية
CREATE INDEX idx_bookings_wilaya      ON bookings(wilaya_id);
CREATE INDEX idx_bookings_status      ON bookings(booking_status);
CREATE INDEX idx_bookings_created     ON bookings(created_at DESC);
CREATE INDEX idx_bookings_geo_status  ON bookings(wilaya_id, booking_status);
CREATE INDEX idx_bookings_geo_time    ON bookings(wilaya_id, created_at DESC);
CREATE INDEX idx_bookings_user        ON bookings(user_id);

-- فهارس المعاملات المالية
CREATE INDEX idx_transactions_paid    ON transactions(paid_at DESC);
CREATE INDEX idx_transactions_status  ON transactions(status);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_cib     ON transactions(cib_ref) WHERE cib_ref IS NOT NULL;

-- فهارس العملاء والولاء
CREATE INDEX idx_users_loyalty        ON users(loyalty_pts DESC);
CREATE INDEX idx_users_tier           ON users(loyalty_tier);
CREATE INDEX idx_users_wilaya         ON users(wilaya_id);
CREATE INDEX idx_users_spent          ON users(total_spent DESC);

-- فهارس الخدمات
CREATE INDEX idx_services_wilaya      ON services(wilaya_id, type);
CREATE INDEX idx_services_type        ON services(type);
CREATE INDEX idx_services_active      ON services(is_active) WHERE is_active = TRUE;

-- فهارس التنبيهات
CREATE INDEX idx_alerts_unread        ON alerts(is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_type          ON alerts(type, created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق Trigger على جداول الحجوزات والمعاملات
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة توليد رقم الحجز التلقائي
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_ref = 'REF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_ref_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1;

CREATE TRIGGER trigger_booking_ref
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_ref();

-- دالة توليد رقم الفاتورة التلقائي
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_seq')::TEXT, 7, '0');
    NEW.paid_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE TRIGGER trigger_invoice_number
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- دالة تحديث نقاط الولاء تلقائياً بعد الدفع
CREATE OR REPLACE FUNCTION update_user_loyalty()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_amount DECIMAL;
  v_pts INTEGER;
  v_new_total DECIMAL;
  v_new_pts INTEGER;
  v_new_tier VARCHAR;
BEGIN
  IF NEW.status = 'success' AND OLD.status != 'success' THEN
    SELECT b.user_id, b.total_dzd INTO v_user_id, v_amount
    FROM bookings b WHERE b.id = NEW.booking_id;

    v_pts := FLOOR(v_amount / 100)::INTEGER;  -- نقطة لكل 100 دينار

    UPDATE users
    SET
      loyalty_pts = loyalty_pts + v_pts,
      total_spent = total_spent + v_amount,
      bookings_count = bookings_count + 1
    WHERE id = v_user_id
    RETURNING loyalty_pts, total_spent INTO v_new_pts, v_new_total;

    -- تحديث مستوى الولاء
    v_new_tier := CASE
      WHEN v_new_total >= 500000 THEN 'platinum'
      WHEN v_new_total >= 200000 THEN 'gold'
      WHEN v_new_total >= 50000  THEN 'silver'
      ELSE 'bronze'
    END;

    UPDATE users SET loyalty_tier = v_new_tier WHERE id = v_user_id;

    INSERT INTO loyalty_history (user_id, booking_id, pts_earned, pts_balance, reason)
    VALUES (v_user_id, NEW.booking_id, v_pts, v_new_pts, 'دفع ناجح عبر CIB');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loyalty_update
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_loyalty();

-- ============================================================
-- VIEWS (طرق العرض الذكية)
-- ============================================================

-- عرض الإيرادات اليومية بالولاية
CREATE OR REPLACE VIEW v_daily_revenue_by_wilaya AS
SELECT
  w.code,
  w.name_ar,
  w.region,
  DATE(t.paid_at) AS revenue_date,
  COUNT(b.id) AS bookings_count,
  SUM(t.amount_dzd) AS total_revenue_dzd,
  SUM(b.commission_dzd) AS platform_commission_dzd
FROM transactions t
JOIN bookings b ON b.id = t.booking_id
JOIN wilayas w ON w.id = b.wilaya_id
WHERE t.status = 'success'
GROUP BY w.code, w.name_ar, w.region, DATE(t.paid_at);

-- عرض الضغط الجغرافي لحظي (آخر 24 ساعة)
CREATE OR REPLACE VIEW v_geo_pressure AS
SELECT
  w.code,
  w.name_ar,
  w.region,
  w.latitude,
  w.longitude,
  COUNT(b.id) AS active_bookings,
  COALESCE(SUM(t.amount_dzd), 0) AS revenue_24h
FROM wilayas w
LEFT JOIN bookings b ON b.wilaya_id = w.id
  AND b.booking_status IN ('confirmed', 'paid')
  AND b.created_at >= NOW() - INTERVAL '24 hours'
LEFT JOIN transactions t ON t.booking_id = b.id AND t.status = 'success'
GROUP BY w.code, w.name_ar, w.region, w.latitude, w.longitude
ORDER BY active_bookings DESC;

-- عرض أفضل العملاء
CREATE OR REPLACE VIEW v_top_customers AS
SELECT
  u.id,
  u.full_name,
  u.phone,
  u.loyalty_pts,
  u.loyalty_tier,
  u.total_spent,
  u.bookings_count,
  w.name_ar AS wilaya
FROM users u
LEFT JOIN wilayas w ON w.id = u.wilaya_id
WHERE u.is_active = TRUE
ORDER BY u.loyalty_pts DESC;

-- ============================================================
-- SEED DATA: 58 ولاية جزائرية
-- ============================================================
INSERT INTO wilayas (code, name_ar, name_fr, region, latitude, longitude) VALUES
(1,  'أدرار',          'Adrar',           'جنوب',       27.8742, -0.2914),
(2,  'الشلف',          'Chlef',           'شمال',       36.1647,  1.3317),
(3,  'الأغواط',        'Laghouat',        'هضاب_عليا',  33.8000,  2.8653),
(4,  'أم البواقي',     'Oum El Bouaghi',  'هضاب_عليا',  35.8704,  7.1126),
(5,  'باتنة',          'Batna',           'هضاب_عليا',  35.5560,  6.1740),
(6,  'بجاية',          'Béjaïa',          'شمال',       36.7500,  5.0833),
(7,  'بسكرة',          'Biskra',          'هضاب_عليا',  34.8500,  5.7333),
(8,  'بشار',           'Béchar',          'جنوب',       31.6167, -2.2167),
(9,  'البليدة',        'Blida',           'شمال',       36.4697,  2.8277),
(10, 'البويرة',        'Bouira',          'شمال',       36.3731,  3.9006),
(11, 'تمنراست',        'Tamanrasset',     'جنوب',       22.7850,  5.5228),
(12, 'تبسة',           'Tébessa',         'هضاب_عليا',  35.4044,  8.1244),
(13, 'تلمسان',         'Tlemcen',         'شمال',       34.8780, -1.3150),
(14, 'تيارت',          'Tiaret',          'هضاب_عليا',  35.3706,  1.3217),
(15, 'تيزي وزو',       'Tizi Ouzou',      'شمال',       36.7167,  4.0500),
(16, 'الجزائر',        'Alger',           'شمال',       36.7372,  3.0869),
(17, 'الجلفة',         'Djelfa',          'هضاب_عليا',  34.6714,  3.2628),
(18, 'جيجل',           'Jijel',           'شمال',       36.8206,  5.7658),
(19, 'سطيف',           'Sétif',           'هضاب_عليا',  36.1900,  5.4114),
(20, 'سعيدة',          'Saïda',           'هضاب_عليا',  34.8309,  0.1456),
(21, 'سكيكدة',         'Skikda',          'شمال',       36.8761,  6.9069),
(22, 'سيدي بلعباس',    'Sidi Bel Abbès',  'شمال',       35.1897, -0.6308),
(23, 'عنابة',          'Annaba',          'شمال',       36.9000,  7.7667),
(24, 'قالمة',          'Guelma',          'شمال',       36.4642,  7.4326),
(25, 'قسنطينة',        'Constantine',     'شمال',       36.3650,  6.6147),
(26, 'المدية',         'Médéa',           'شمال',       36.2636,  2.7506),
(27, 'مستغانم',        'Mostaganem',      'شمال',       35.9333,  0.0833),
(28, 'المسيلة',        'M''Sila',         'هضاب_عليا',  35.7044,  4.5417),
(29, 'معسكر',          'Mascara',         'هضاب_عليا',  35.3961,  0.1400),
(30, 'ورقلة',          'Ouargla',         'جنوب',       31.9500,  5.3333),
(31, 'وهران',          'Oran',            'شمال',       35.6911, -0.6417),
(32, 'البيض',          'El Bayadh',       'هضاب_عليا',  33.6831,  1.0178),
(33, 'إليزي',          'Illizi',          'جنوب',       26.4800,  8.4800),
(34, 'برج بوعريريج',   'Bordj Bou Arréridj','هضاب_عليا',36.0689,  4.7600),
(35, 'بومرداس',        'Boumerdès',       'شمال',       36.7667,  3.4833),
(36, 'الطارف',         'El Tarf',         'شمال',       36.7672,  8.3139),
(37, 'تندوف',          'Tindouf',         'جنوب',       27.6742, -8.1472),
(38, 'تيسمسيلت',       'Tissemsilt',      'هضاب_عليا',  35.6078,  1.8142),
(39, 'الوادي',         'El Oued',         'جنوب',       33.3683,  6.8633),
(40, 'خنشلة',          'Khenchela',       'هضاب_عليا',  35.4286,  7.1431),
(41, 'سوق أهراس',      'Souk Ahras',      'شمال',       36.2847,  7.9508),
(42, 'تيبازة',         'Tipaza',          'شمال',       36.5892,  2.4469),
(43, 'ميلة',           'Mila',            'هضاب_عليا',  36.4500,  6.2639),
(44, 'عين الدفلى',     'Aïn Defla',       'شمال',       36.2633,  1.9669),
(45, 'النعامة',        'Naâma',           'هضاب_عليا',  33.2667, -0.3167),
(46, 'عين تموشنت',     'Aïn Témouchent',  'شمال',       35.2961, -1.1394),
(47, 'غرداية',         'Ghardaïa',        'جنوب',       32.4900,  3.6739),
(48, 'غليزان',         'Relizane',        'شمال',       35.7333,  0.5667),
(49, 'تيميمون',        'Timimoun',        'جنوب',       29.2631,  0.2403),
(50, 'برج باجي مختار', 'Bordj Badji Mokhtar','جنوب',   23.0561, -0.9242),
(51, 'أولاد جلال',     'Ouled Djellal',   'جنوب',       34.4183,  5.0661),
(52, 'بني عباس',       'Béni Abbès',      'جنوب',       30.1283, -2.1622),
(53, 'عين صالح',       'In Salah',        'جنوب',       27.1967,  2.4797),
(54, 'عين قزام',       'In Guezzam',      'جنوب',       19.5667,  5.7667),
(55, 'تقرت',           'Touggourt',       'جنوب',       33.1000,  6.0706),
(56, 'جانت',           'Djanet',          'جنوب',       24.5547,  9.4844),
(57, 'المغير',         'El M''Ghair',     'جنوب',       33.9500,  5.9167),
(58, 'المنيعة',        'El Meniaa',       'جنوب',       30.5833,  2.8833);

-- ============================================================
-- SEED DATA: خدمات تجريبية للمدن الكبرى
-- ============================================================
DO $$
DECLARE
  v_alger UUID;
  v_oran UUID;
  v_constantine UUID;
  v_ghardaia UUID;
  v_tamanrasset UUID;
  v_provider1 UUID;
  v_provider2 UUID;
BEGIN
  SELECT id INTO v_alger FROM wilayas WHERE code = 16;
  SELECT id INTO v_oran FROM wilayas WHERE code = 31;
  SELECT id INTO v_constantine FROM wilayas WHERE code = 25;
  SELECT id INTO v_ghardaia FROM wilayas WHERE code = 47;
  SELECT id INTO v_tamanrasset FROM wilayas WHERE code = 11;

  INSERT INTO service_providers (name_ar, type, wilaya_id, phone, commission_pct)
  VALUES ('فندق الجزائر الكبير', 'hotel', v_alger, '+213 21 000001', 12.00)
  RETURNING id INTO v_provider1;

  INSERT INTO service_providers (name_ar, type, wilaya_id, phone, commission_pct)
  VALUES ('مطعم القصبة التقليدي', 'restaurant', v_alger, '+213 21 000002', 8.00)
  RETURNING id INTO v_provider2;

  INSERT INTO services (provider_id, type, name_ar, wilaya_id, price_dzd, price_unit, capacity)
  VALUES
    (v_provider1, 'hotel', 'غرفة ديلوكس مزدوجة', v_alger, 12000.00, 'per_night', 2),
    (v_provider1, 'hotel', 'جناح رئاسي', v_alger, 35000.00, 'per_night', 4),
    (v_provider2, 'restaurant', 'طبق كسكسي تقليدي', v_alger, 1500.00, 'per_person', 50);
END$$;

-- تأكيد التثبيت
SELECT 'RAFIQ DB INITIALIZED SUCCESSFULLY ✓' AS status;
SELECT COUNT(*) AS wilayas_count FROM wilayas;
