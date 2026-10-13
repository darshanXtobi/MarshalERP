import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentIsolation } from '../middleware/auth.js';

const router = express.Router();

// List students with search, filters (department, program, semester, division)
router.get('/', authenticateToken, (req, res) => {
  const { search, programId, semester, division } = req.query;
  let query = `
    SELECT s.id, s.prn, s.roll_no, s.seat_no, s.name, s.email, s.current_sem, s.division, s.batch, s.academic_year, s.gender, s.phone,
           p.name as program_name, d.name as department_name
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE s.is_active = 1
  `;
  const params = [];

  if (search) {
    query += ` AND (s.name LIKE ? OR s.prn LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (programId) {
    query += ` AND s.program_id = ?`;
    params.push(programId);
  }
  if (semester) {
    query += ` AND s.current_sem = ?`;
    params.push(Number(semester));
  }
  if (division) {
    query += ` AND s.division = ?`;
    params.push(division);
  }

  query += ` ORDER BY s.division ASC, s.roll_no ASC`;
  const students = db.prepare(query).all(...params);
  res.json({ students, total: students.length });
});

// Get Student Full Dossier by ID (protected by student isolation)
router.get('/:studentId', authenticateToken, enforceStudentIsolation, (req, res) => {
  const { studentId } = req.params;
  const student = db.prepare(`
    SELECT s.*, p.name as program_name, p.degree, d.name as department_name, c.name as college_name, c.logo_url
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE s.id = ?
  `).get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Remove sensitive hash from payload
  delete student.password_hash;
  res.json({ student });
});

// Create new student admission (Staff role required)
router.post('/', authenticateToken, requireRole('super_admin', 'principal', 'hod'), (req, res) => {
  const { prn, roll_no, seat_no, name, email, password, program_id, current_sem, division, batch, academic_year, phone, parent_phone, address, blood_group } = req.body;
  if (!prn || !roll_no || !name || !email || !program_id) {
    return res.status(400).json({ error: 'Missing required admission fields.' });
  }

  const id = uuidv4();
  const pwdHash = bcrypt.hashSync(password || 'student123', 10);

  try {
    db.prepare(`
      INSERT INTO students (id, prn, roll_no, seat_no, name, email, password_hash, program_id, current_sem, division, batch, academic_year, phone, parent_phone, address, blood_group)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, prn, roll_no, seat_no, name, email, pwdHash, program_id, current_sem || 1, division || 'A', batch || 'B1', academic_year || '2025-2026', phone, parent_phone, address, blood_group);

    res.status(201).json({ message: 'Student registered successfully', studentId: id });
  } catch (err) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'PRN or Email already registered' : err.message });
  }
});

export default router;
