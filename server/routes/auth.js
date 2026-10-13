import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Staff Login
router.post('/staff-login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare(`
    SELECT u.*, d.name as department_name, c.name as college_name, c.logo_url
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE u.username = ? OR u.email = ?
  `).get(username, username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
    userType: 'staff',
    departmentId: user.department_id
  });

  res.json({
    message: 'Staff authentication successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      userType: 'staff',
      departmentName: user.department_name,
      collegeName: user.college_name,
      avatarUrl: user.avatar_url
    }
  });
});

// Student Login (Also compatible with legacy EduPlusCampus endpoint /AppLoginNew/signin)
router.post(['/student-login', '/AppLoginNew/signin'], (req, res) => {
  // Support either body: { prn, password } or EduPlus format { params: { email, password } }
  const prn = req.body.prn || (req.body.params && (req.body.params.email || req.body.params.prn)) || req.body.email;
  const password = req.body.password || (req.body.params && req.body.params.password);

  if (!prn || !password) {
    return res.status(400).json({ error: 'PRN/Email and password are required.' });
  }

  const student = db.prepare(`
    SELECT s.*, p.name as program_name, p.degree, d.name as department_name, c.name as college_name, c.logo_url
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE s.prn = ? OR s.email = ? OR s.roll_no = ?
  `).get(prn, prn, prn);

  if (!student || !bcrypt.compareSync(password, student.password_hash)) {
    return res.status(401).json({ error: 'Invalid PRN or password.' });
  }

  const token = generateToken({
    id: student.id,
    studentId: student.id,
    prn: student.prn,
    rollNo: student.roll_no,
    name: student.name,
    userType: 'student',
    role: 'student',
    programId: student.program_id,
    currentSem: student.current_sem,
    division: student.division
  });

  res.json({
    message: 'Student authentication successful',
    accessToken: token,
    refreshToken: token,
    token,
    student: {
      id: student.id,
      studentId: student.id,
      prn: student.prn,
      rollNo: student.roll_no,
      seatNo: student.seat_no,
      name: student.name,
      email: student.email,
      programName: student.program_name,
      currentSem: student.current_sem,
      division: student.division,
      batch: student.batch,
      academicYear: student.academic_year,
      userType: 'student',
      collegeName: student.college_name,
      logoUrl: student.logo_url
    }
  });
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  if (req.user.userType === 'staff') {
    const user = db.prepare(`
      SELECT u.id, u.username, u.email, u.display_name, u.role, u.avatar_url, d.name as department_name, c.name as college_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN colleges c ON d.college_id = c.id
      WHERE u.id = ?
    `).get(req.user.id);
    return res.json({ userType: 'staff', profile: user });
  } else {
    const student = db.prepare(`
      SELECT s.*, p.name as program_name, p.degree, d.name as department_name, c.name as college_name, c.logo_url
      FROM students s
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN colleges c ON d.college_id = c.id
      WHERE s.id = ?
    `).get(req.user.studentId);
    return res.json({ userType: 'student', profile: student });
  }
});

export default router;
