import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentIsolation } from '../middleware/auth.js';

const router = express.Router();

// List transport routes
router.get('/routes', authenticateToken, (req, res) => {
  const routes = db.prepare(`
    SELECT r.*, COUNT(s.id) as stops_count, COUNT(st.id) as enrolled_students
    FROM transport_routes r
    LEFT JOIN transport_stops s ON r.id = s.route_id
    LEFT JOIN student_transport st ON r.id = st.route_id
    GROUP BY r.id
  `).all();

  const stops = db.prepare('SELECT * FROM transport_stops ORDER BY stop_order ASC').all();
  res.json({ routes, stops });
});

// Get Student Transport Details (Learner Portal & legacy /Transport/getViewTransportFeesReceipt)
router.get(['/student/:studentId', '/getViewTransportFeesReceipt'], authenticateToken, enforceStudentIsolation, (req, res) => {
  const studentId = req.params.studentId || (req.user && req.user.studentId);
  if (!studentId) return res.status(400).json({ error: 'Student ID required.' });

  const transport = db.prepare(`
    SELECT st.*, tr.route_name, tr.vehicle_no, tr.driver_name, tr.driver_phone, tr.annual_fee,
           ts.stop_name, ts.pickup_time, ts.drop_time,
           s.name as student_name, s.prn, s.roll_no, s.division
    FROM student_transport st
    JOIN transport_routes tr ON st.route_id = tr.id
    LEFT JOIN transport_stops ts ON st.stop_id = ts.id
    JOIN students s ON st.student_id = s.id
    WHERE st.student_id = ?
  `).get(studentId);

  res.json({ transport: transport || null });
});

// Assign Student to Route (Transport Admin)
router.post('/assign', authenticateToken, requireRole('transport', 'super_admin'), (req, res) => {
  const { studentId, routeId, stopId, busPassNo } = req.body;
  if (!studentId || !routeId) return res.status(400).json({ error: 'Student and route are required.' });

  const passNo = busPassNo || `BP-PCCOE-2026-${Math.floor(100 + Math.random() * 900)}`;

  try {
    db.prepare(`
      INSERT INTO student_transport (id, student_id, route_id, stop_id, bus_pass_no, academic_year, status)
      VALUES (?, ?, ?, ?, ?, '2025-2026', 'Active')
      ON CONFLICT(student_id) DO UPDATE SET
        route_id = excluded.route_id,
        stop_id = excluded.stop_id,
        bus_pass_no = excluded.bus_pass_no,
        status = 'Active'
    `).run(uuidv4(), studentId, routeId, stopId || null, passNo);

    res.json({ message: 'Transport assigned successfully', busPassNo: passNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
