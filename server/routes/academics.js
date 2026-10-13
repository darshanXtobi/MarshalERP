import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Departments & Programs
router.get('/departments', authenticateToken, (req, res) => {
  const departments = db.prepare('SELECT * FROM departments').all();
  res.json({ departments });
});

router.get('/programs', authenticateToken, (req, res) => {
  const programs = db.prepare(`
    SELECT p.*, d.name as department_name
    FROM programs p
    JOIN departments d ON p.department_id = d.id
  `).all();
  res.json({ programs });
});

// Courses
router.get('/courses', authenticateToken, (req, res) => {
  const { semester, programId } = req.query;
  let sql = 'SELECT * FROM courses WHERE 1=1';
  const params = [];
  if (semester) { sql += ' AND semester = ?'; params.push(Number(semester)); }
  if (programId) { sql += ' AND program_id = ?'; params.push(programId); }
  const courses = db.prepare(sql).all(...params);
  res.json({ courses });
});

// Timetable
router.get('/timetable', authenticateToken, (req, res) => {
  const { semester = 6, division = 'A' } = req.query;
  const timetable = db.prepare(`
    SELECT tt.*, c.name as course_name, c.code as course_code, u.display_name as faculty_name
    FROM timetables tt
    JOIN courses c ON tt.course_id = c.id
    JOIN users u ON tt.faculty_id = u.id
    WHERE tt.semester = ? AND tt.division = ?
    ORDER BY CASE tt.day_of_week
      WHEN 'Monday' THEN 1
      WHEN 'Tuesday' THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday' THEN 4
      WHEN 'Friday' THEN 5
      ELSE 6
    END, tt.period_no ASC
  `).all(Number(semester), division);

  res.json({ timetable });
});

// Campus Notices
router.get('/notices', authenticateToken, (req, res) => {
  const notices = db.prepare(`
    SELECT n.*, u.display_name as author_name
    FROM notices n
    JOIN users u ON n.created_by = u.id
    ORDER BY n.created_at DESC
  `).all();
  res.json({ notices });
});

router.post('/notices', authenticateToken, requireRole('super_admin', 'principal', 'hod', 'exam_controller'), (req, res) => {
  const { title, category, content, target_role } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO notices (id, title, category, content, target_role, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, category || 'General', content, target_role || 'all', req.user.id);

  res.status(201).json({ message: 'Notice posted successfully', noticeId: id });
});

// Grievance / Inquiries
router.get('/grievances', authenticateToken, (req, res) => {
  let query = `
    SELECT g.*, s.name as student_name, s.prn, s.roll_no, u.display_name as resolver_name
    FROM grievances g
    JOIN students s ON g.student_id = s.id
    LEFT JOIN users u ON g.resolved_by = u.id
  `;
  const params = [];
  if (req.user.userType === 'student') {
    query += ` WHERE g.student_id = ?`;
    params.push(req.user.studentId);
  }
  query += ` ORDER BY g.created_at DESC`;
  const grievances = db.prepare(query).all(...params);
  res.json({ grievances });
});

router.post('/grievances', authenticateToken, (req, res) => {
  const { category, subject, description } = req.body;
  if (!subject || !description) return res.status(400).json({ error: 'Subject and description required' });

  const studentId = req.user.userType === 'student' ? req.user.studentId : req.body.studentId;
  const ticketNo = `TKT-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const id = uuidv4();

  db.prepare(`
    INSERT INTO grievances (id, student_id, ticket_no, category, subject, description, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Open')
  `).run(id, studentId, ticketNo, category || 'Academic', subject, description);

  res.status(201).json({ message: 'Grievance ticket registered', ticketNo });
});

router.put('/grievances/:id', authenticateToken, requireRole('faculty', 'hod', 'principal', 'super_admin'), (req, res) => {
  const { status, resolution } = req.body;
  db.prepare(`
    UPDATE grievances
    SET status = ?, resolution = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status || 'Resolved', resolution, req.user.id, req.params.id);

  res.json({ message: 'Grievance ticket updated' });
});

export default router;
