import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentIsolation } from '../middleware/auth.js';
import { broadcastEvent } from '../services/websocket.js';

const router = express.Router();

// Record / Submit Lecture Attendance (Staff: Faculty, HOD, Admin)
router.post('/mark', authenticateToken, requireRole('faculty', 'hod', 'super_admin'), (req, res) => {
  const { courseId, semester, division, batch, sessionDate, periodNo, topicDelivered, studentRecords } = req.body;

  if (!courseId || !semester || !division || !sessionDate || !studentRecords || !Array.isArray(studentRecords)) {
    return res.status(400).json({ error: 'Missing required attendance payload parameters.' });
  }

  const sessionId = uuidv4();
  const facultyId = req.user.id;

  try {
    db.transaction(() => {
      // 1. Insert session
      db.prepare(`
        INSERT INTO attendance_sessions (id, course_id, faculty_id, semester, division, batch, session_date, period_no, topic_delivered)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, courseId, facultyId, semester, division, batch || null, sessionDate, periodNo || 1, topicDelivered || 'Lecture Session');

      // 2. Insert records
      const insertRecord = db.prepare(`
        INSERT INTO attendance_records (id, session_id, student_id, status, remarks)
        VALUES (?, ?, ?, ?, ?)
      `);

      studentRecords.forEach(rec => {
        insertRecord.run(uuidv4(), sessionId, rec.studentId, rec.status || 'Present', rec.remarks || null);
      });
    })();

    // Broadcast live event to update connected student dashboards
    broadcastEvent('ATTENDANCE_UPDATED', { courseId, semester, division });

    res.json({ message: 'Attendance recorded successfully', sessionId, totalStudents: studentRecords.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record attendance: ' + err.message });
  }
});

// Get Student Attendance Summary & Subject Breakdown (Supports Learner portal + EduPlusCampus format)
router.get(['/student/:studentId', '/learnerAttendence'], authenticateToken, enforceStudentIsolation, (req, res) => {
  const studentId = req.params.studentId || req.query.studentId || (req.user && req.user.studentId);
  const sem = req.query.sem || 6;

  if (!studentId) {
    return res.status(400).json({ error: 'Student identifier required.' });
  }

  // Get enrolled courses for student's semester
  const courses = db.prepare(`
    SELECT c.id, c.code, c.name, c.credits, c.course_type
    FROM courses c
    JOIN students s ON s.program_id = c.program_id AND s.current_sem = c.semester
    WHERE s.id = ? AND c.semester = ?
  `).all(studentId, sem);

  let totalConductedAll = 0;
  let totalAttendedAll = 0;

  const subjectAttendance = courses.map(course => {
    // Total sessions conducted for this course and student's division
    const conductedRow = db.prepare(`
      SELECT COUNT(ar.id) as conducted,
             SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as attended
      FROM attendance_records ar
      JOIN attendance_sessions ass ON ar.session_id = ass.id
      WHERE ass.course_id = ? AND ar.student_id = ?
    `).get(course.id, studentId);

    const conducted = conductedRow ? Number(conductedRow.conducted || 0) : 0;
    const attended = conductedRow ? Number(conductedRow.attended || 0) : 0;
    const percentage = conducted > 0 ? Math.round((attended / conducted) * 1000) / 10 : 100.0;

    totalConductedAll += conducted;
    totalAttendedAll += attended;

    return {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      courseType: course.course_type,
      conductedLectures: conducted,
      attendedLectures: attended,
      percentage,
      isShortage: percentage < 75.0
    };
  });

  const overallPercentage = totalConductedAll > 0
    ? Math.round((totalAttendedAll / totalConductedAll) * 1000) / 10
    : 100.0;

  // Student and division info
  const student = db.prepare(`SELECT prn, roll_no, name, division, current_sem FROM students WHERE id = ?`).get(studentId);

  res.json({
    student,
    overall: {
      totalConducted: totalConductedAll,
      totalAttended: totalAttendedAll,
      percentage: overallPercentage,
      status: overallPercentage >= 75.0 ? 'Satisfactory' : 'Attendance Shortage Alert'
    },
    subjects: subjectAttendance,
    // EduPlus legacy compatibility wrapper
    learnerDivision: [{ overall_percentage: overallPercentage }],
    learner_info: student
  });
});

// Staff Attendance Analysis Report
router.get('/report', authenticateToken, requireRole('faculty', 'hod', 'principal', 'super_admin'), (req, res) => {
  const { courseId, division } = req.query;

  let query = `
    SELECT s.id as student_id, s.prn, s.roll_no, s.name, s.division,
           COUNT(ar.id) as total_conducted,
           SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as total_attended
    FROM students s
    LEFT JOIN attendance_records ar ON s.id = ar.student_id
    LEFT JOIN attendance_sessions ass ON ar.session_id = ass.id
    WHERE s.is_active = 1
  `;
  const params = [];

  if (courseId) {
    query += ` AND ass.course_id = ?`;
    params.push(courseId);
  }
  if (division) {
    query += ` AND s.division = ?`;
    params.push(division);
  }

  query += ` GROUP BY s.id ORDER BY s.roll_no ASC`;
  const rows = db.prepare(query).all(...params);

  const report = rows.map(r => {
    const conducted = Number(r.total_conducted || 0);
    const attended = Number(r.total_attended || 0);
    const pct = conducted > 0 ? Math.round((attended / conducted) * 1000) / 10 : 0.0;
    return {
      ...r,
      percentage: pct,
      shortage: pct < 75.0
    };
  });

  res.json({ report, totalStudents: report.length });
});

export default router;
