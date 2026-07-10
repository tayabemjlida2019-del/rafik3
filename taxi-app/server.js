/**
 * ================================================================
 * GHARDAIA TAXI APP — server.js (Production / PostgreSQL)
 * Backend: Node.js + Express + pg (PostgreSQL)
 * Compatible with: Supabase, Neon, any PostgreSQL provider
 * Hosting: Render (free tier)
 * ================================================================
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── DATABASE CONNECTION ──────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Check your .env file or Render environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }   // Required for Supabase / Neon / Render
});

// Test DB connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connected at:', res.rows[0].now);
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── HELPERS ─────────────────────────────────────────────────────
const VALID_DESTINATIONS = ['Algiers', 'Oran', 'Tunisia'];

function isValidDestination(d) {
  return VALID_DESTINATIONS.includes(d);
}

// ─── ROUTE: POST /api/auth/login ─────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM taxi_drivers WHERE username = $1 AND password = $2',
      [username.trim(), password.trim()]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const driver = rows[0];
    const { password: _, ...driverData } = driver;

    // Get active ride for this driver
    const rideRes = await pool.query(
      "SELECT * FROM taxi_rides WHERE driver_id = $1 AND status != 'Departed' ORDER BY created_at DESC LIMIT 1",
      [driver.id]
    );

    res.json({
      success: true,
      driver: driverData,
      activeRide: rideRes.rows[0] ? mapRide(rideRes.rows[0]) : null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: POST /api/rides ───────────────────────────────────────
app.post('/api/rides', async (req, res) => {
  const { driverId, destination, departureTime } = req.body;

  if (!driverId || !destination || !departureTime)
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });

  if (!isValidDestination(destination))
    return res.status(400).json({ success: false, message: 'الوجهة غير صحيحة' });

  if (new Date(departureTime) <= new Date())
    return res.status(400).json({ success: false, message: 'وقت المغادرة يجب أن يكون في المستقبل' });

  try {
    // Verify driver exists
    const drvRes = await pool.query('SELECT * FROM taxi_drivers WHERE id = $1', [driverId]);
    if (!drvRes.rows.length)
      return res.status(404).json({ success: false, message: 'السائق غير موجود' });

    const driver = drvRes.rows[0];

    // Check for existing active ride
    const existingRes = await pool.query(
      "SELECT id FROM taxi_rides WHERE driver_id = $1 AND status != 'Departed'",
      [driverId]
    );
    if (existingRes.rows.length)
      return res.status(409).json({ success: false, message: 'لديك رحلة نشطة بالفعل' });

    const { rows } = await pool.query(
      `INSERT INTO taxi_rides (driver_id, driver_name, driver_phone, vehicle, destination, departure_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [driver.id, driver.name, driver.phone, driver.vehicle, destination, new Date(departureTime)]
    );

    res.status(201).json({ success: true, message: 'تم إنشاء الرحلة بنجاح', ride: mapRide(rows[0]) });
  } catch (err) {
    console.error('Create ride error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: GET /api/rides ────────────────────────────────────────
app.get('/api/rides', async (req, res) => {
  const { destination } = req.query;

  let query = "SELECT * FROM taxi_rides WHERE status = 'Pending' AND available_seats > 0";
  const params = [];

  if (destination && isValidDestination(destination)) {
    params.push(destination);
    query += ` AND destination = $${params.length}`;
  }

  query += ' ORDER BY departure_time ASC';

  try {
    const { rows } = await pool.query(query, params);
    res.json({ success: true, count: rows.length, rides: rows.map(mapRide) });
  } catch (err) {
    console.error('Get rides error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: GET /api/rides/:id ────────────────────────────────────
app.get('/api/rides/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM taxi_rides WHERE id = $1', [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });
    res.json({ success: true, ride: mapRide(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: POST /api/bookings ────────────────────────────────────
app.post('/api/bookings', async (req, res) => {
  const { rideId, passengerName, passengerPhone, seatsBooked, latitude, longitude } = req.body;

  if (!rideId || !passengerName || !passengerPhone || !seatsBooked)
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });

  const seatsNum = parseInt(seatsBooked);
  if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 7)
    return res.status(400).json({ success: false, message: 'عدد المقاعد يجب أن يكون بين 1 و 7' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the ride row for update
    const rideRes = await client.query(
      'SELECT * FROM taxi_rides WHERE id = $1 FOR UPDATE',
      [rideId]
    );
    if (!rideRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });
    }

    const ride = rideRes.rows[0];

    if (ride.status === 'Departed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'هذه الرحلة قد انطلقت بالفعل' });
    }
    if (seatsNum > ride.available_seats) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `المقاعد المطلوبة (${seatsNum}) أكثر من المتاحة (${ride.available_seats})`
      });
    }

    // Insert booking
    const bookRes = await client.query(
      `INSERT INTO taxi_bookings (ride_id, passenger_name, passenger_phone, seats_booked, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [rideId, passengerName.trim(), passengerPhone.trim(), seatsNum, latitude || null, longitude || null]
    );

    // Update available seats
    const newAvailable = ride.available_seats - seatsNum;
    const newStatus = newAvailable === 0 ? 'Full' : 'Pending';
    const updatedRide = await client.query(
      'UPDATE taxi_rides SET available_seats = $1, status = $2 WHERE id = $3 RETURNING *',
      [newAvailable, newStatus, rideId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'تم حجز مقعدك بنجاح!',
      booking: mapBooking(bookRes.rows[0]),
      ride: mapRide(updatedRide.rows[0])
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  } finally {
    client.release();
  }
});

// ─── ROUTE: GET /api/rides/:id/passengers ────────────────────────
app.get('/api/rides/:id/passengers', async (req, res) => {
  const { id } = req.params;
  const { driverId } = req.query;

  try {
    const rideRes = await pool.query('SELECT * FROM taxi_rides WHERE id = $1', [id]);
    if (!rideRes.rows.length)
      return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });

    const ride = rideRes.rows[0];
    if (driverId && ride.driver_id !== driverId)
      return res.status(403).json({ success: false, message: 'غير مصرح لك بعرض ركاب هذه الرحلة' });

    const bookRes = await pool.query(
      'SELECT * FROM taxi_bookings WHERE ride_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const totalBooked = bookRes.rows.reduce((s, b) => s + b.seats_booked, 0);

    res.json({
      success: true,
      ride: mapRide(ride),
      passengerCount: totalBooked,
      bookings: bookRes.rows.map(mapBooking)
    });
  } catch (err) {
    console.error('Passengers error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: PATCH /api/rides/:id/status ──────────────────────────
app.patch('/api/rides/:id/status', async (req, res) => {
  const { status, driverId } = req.body;
  const validStatuses = ['Pending', 'Full', 'Departed'];

  if (!validStatuses.includes(status))
    return res.status(400).json({ success: false, message: 'حالة غير صحيحة' });

  try {
    const check = await pool.query('SELECT driver_id FROM taxi_rides WHERE id = $1', [req.params.id]);
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });

    if (driverId && check.rows[0].driver_id !== driverId)
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });

    const { rows } = await pool.query(
      'UPDATE taxi_rides SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json({ success: true, message: `تم تحديث الحالة إلى: ${status}`, ride: mapRide(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── ROUTE: DELETE /api/rides/:id ────────────────────────────────
app.delete('/api/rides/:id', async (req, res) => {
  const { driverId } = req.body;

  try {
    const check = await pool.query('SELECT driver_id FROM taxi_rides WHERE id = $1', [req.params.id]);
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: 'الرحلة غير موجودة' });

    if (driverId && check.rows[0].driver_id !== driverId)
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });

    await pool.query('DELETE FROM taxi_rides WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'تم إلغاء الرحلة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ─── HEALTH CHECK (Render ping) ───────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── FALLBACK → SPA ───────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── MAPPERS: snake_case DB → camelCase API ───────────────────────
function mapRide(r) {
  return {
    id:             r.id,
    driverId:       r.driver_id,
    driverName:     r.driver_name,
    driverPhone:    r.driver_phone,
    vehicle:        r.vehicle,
    destination:    r.destination,
    departureTime:  r.departure_time,
    totalSeats:     r.total_seats,
    availableSeats: r.available_seats,
    status:         r.status,
    createdAt:      r.created_at
  };
}

function mapBooking(b) {
  return {
    id:             b.id,
    rideId:         b.ride_id,
    passengerName:  b.passenger_name,
    passengerPhone: b.passenger_phone,
    seatsBooked:    b.seats_booked,
    latitude:       b.latitude,
    longitude:      b.longitude,
    createdAt:      b.created_at
  };
}

// ─── START ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   🚖 GHARDAIA TAXI APP — SERVER RUNNING  ║');
  console.log(`  ║   📡 http://localhost:${PORT}               ║`);
  console.log(`  ║   🌍 NODE_ENV: ${(process.env.NODE_ENV || 'development').padEnd(24)}║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
