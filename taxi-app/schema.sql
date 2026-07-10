-- ================================================================
-- GHARDAIA TAXI APP — SCHEMA (يضاف لقاعدة بيانات الرفيق الموجودة)
-- الجداول تبدأ بـ taxi_ لتجنب أي تعارض مع جداول منصة الرفيق
-- شغّل هذا مباشرة على Render PostgreSQL Console
-- ================================================================

-- ── جدول السائقين ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxi_drivers (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  vehicle      TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── جدول الرحلات ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxi_rides (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  driver_id       TEXT NOT NULL REFERENCES taxi_drivers(id) ON DELETE CASCADE,
  driver_name     TEXT NOT NULL,
  driver_phone    TEXT NOT NULL,
  vehicle         TEXT NOT NULL,
  destination     TEXT NOT NULL CHECK (destination IN ('Algiers','Oran','Tunisia')),
  departure_time  TIMESTAMPTZ NOT NULL,
  total_seats     INTEGER NOT NULL DEFAULT 7,
  available_seats INTEGER NOT NULL DEFAULT 7,
  status          TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Full','Departed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── جدول الحجوزات ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxi_bookings (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ride_id         TEXT NOT NULL REFERENCES taxi_rides(id) ON DELETE CASCADE,
  passenger_name  TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  seats_booked    INTEGER NOT NULL DEFAULT 1,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── بيانات أولية: السائقون ────────────────────────────────────────
INSERT INTO taxi_drivers (id, name, phone, username, password, vehicle, plate_number)
VALUES
  ('drv-001', 'أحمد بن علي',     '0550123456', 'ahmed',       '1234', 'Toyota Hiace 2022',      '47501-147'),
  ('drv-002', 'محمد الصالح',     '0661987654', 'mohamed',     '1234', 'Mercedes Sprinter 2021', '47502-238'),
  ('drv-003', 'عبد القادر زروق', '0770456789', 'abdelkader',  '1234', 'Toyota Hiace 2023',      '47503-391')
ON CONFLICT (id) DO NOTHING;

-- ── فهارس للأداء ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_taxi_rides_status      ON taxi_rides(status);
CREATE INDEX IF NOT EXISTS idx_taxi_rides_destination ON taxi_rides(destination);
CREATE INDEX IF NOT EXISTS idx_taxi_rides_driver      ON taxi_rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_taxi_bookings_ride     ON taxi_bookings(ride_id);
