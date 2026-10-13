import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { kv } from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentIsolation } from '../middleware/auth.js';
import { calculateStudentResult } from '../services/gradingEngine.js';
import { broadcastEvent } from '../services/websocket.js';

const router = express.Router();

// List examinations
router.get('/', authenticateToken, (req, res) => {
  const exams = db.prepare(`
    SELECT e.*, COUNT(DISTINCT sr.student_id) as results_count
    FROM examinations e
    LEFT JOIN student_results sr ON e.id = sr.exam_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `).all();
  res.json({ exams });
});

// Create new examination (Exam Controller, Admin)
router.post('/', authenticateToken, requireRole('exam_controller', 'super_admin'), (req, res) => {
  const { title, academic_year, semester, exam_type, start_date, end_date } = req.body;
  if (!title || !academic_year || !semester) {
    return res.status(400).json({ error: 'Title, academic year, and semester are required.' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO examinations (id, title, academic_year, semester, exam_type, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, academic_year, semester, exam_type || 'Regular', start_date || null, end_date || null);

  res.status(201).json({ message: 'Examination created successfully', examId: id });
});

// Get components for an examination
router.get('/:examId/components', authenticateToken, (req, res) => {
  const { examId } = req.params;
  const components = db.prepare(`
    SELECT ec.*, c.code as course_code, c.name as course_name, c.credits, c.course_type
    FROM exam_components ec
    JOIN courses c ON ec.course_id = c.id
    WHERE ec.exam_id = ?
    ORDER BY c.code ASC, ec.component_name ASC
  `).all(examId);

  res.json({ components });
});

// Get Marks Entry Grid for a specific component
router.get('/:examId/components/:componentId/marks', authenticateToken, (req, res) => {
  const { componentId } = req.params;
  const comp = db.prepare(`
    SELECT ec.*, c.name as course_name, c.code as course_code
    FROM exam_components ec
    JOIN courses c ON ec.course_id = c.id
    WHERE ec.id = ?
  `).get(componentId);

  if (!comp) return res.status(404).json({ error: 'Exam component not found' });

  // Get enrolled students and their current marks
  const students = db.prepare(`
    SELECT s.id as student_id, s.prn, s.roll_no, s.name, s.division,
           sm.marks_obtained, sm.is_absent
    FROM students s
    LEFT JOIN student_marks sm ON s.id = sm.student_id AND sm.component_id = ?
    WHERE s.is_active = 1
    ORDER BY s.division ASC, s.roll_no ASC
  `).all(componentId);

  res.json({ component: comp, students });
});

// Submit / Update Marks for Component (Faculty, Exam Controller)
router.post('/marks', authenticateToken, requireRole('faculty', 'exam_controller', 'super_admin'), (req, res) => {
  const { componentId, marksList } = req.body;
  if (!componentId || !marksList || !Array.isArray(marksList)) {
    return res.status(400).json({ error: 'Missing componentId or marksList.' });
  }

  const comp = db.prepare('SELECT max_marks, exam_id FROM exam_components WHERE id = ?').get(componentId);
  if (!comp) return res.status(404).json({ error: 'Exam component not found' });

  // Check if exam marks entry is locked
  const exam = db.prepare('SELECT is_marks_entry_locked FROM examinations WHERE id = ?').get(comp.exam_id);
  if (exam && exam.is_marks_entry_locked) {
    return res.status(403).json({ error: 'Marks entry is locked for this examination.' });
  }

  const facultyId = req.user.id;
  const upsertMark = db.prepare(`
    INSERT INTO student_marks (id, component_id, student_id, marks_obtained, is_absent, entered_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(component_id, student_id) DO UPDATE SET
      marks_obtained = excluded.marks_obtained,
      is_absent = excluded.is_absent,
      entered_by = excluded.entered_by,
      updated_at = CURRENT_TIMESTAMP
  `);

  try {
    db.transaction(() => {
      marksList.forEach(item => {
        const marks = item.is_absent ? 0 : Number(item.marks_obtained);
        if (marks > comp.max_marks || marks < 0) {
          throw new Error(`Invalid marks (${marks}) for student. Max permitted is ${comp.max_marks}.`);
        }
        upsertMark.run(uuidv4(), componentId, item.student_id, marks, item.is_absent ? 1 : 0, facultyId);
      });
    })();

    res.json({ message: 'Marks recorded successfully', count: marksList.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Run Result Calculation Engine for Exam (Exam Controller, Admin)
router.post('/:examId/calculate', authenticateToken, requireRole('exam_controller', 'super_admin'), (req, res) => {
  const { examId } = req.params;
  const exam = db.prepare('SELECT * FROM examinations WHERE id = ?').get(examId);
  if (!exam) return res.status(404).json({ error: 'Examination not found' });

  // Get all courses and components in this exam
  const courses = db.prepare(`
    SELECT DISTINCT c.id, c.code, c.name, c.credits, c.course_type
    FROM courses c
    JOIN exam_components ec ON c.id = ec.course_id
    WHERE ec.exam_id = ?
  `).all(examId);

  const components = db.prepare('SELECT * FROM exam_components WHERE exam_id = ?').all(examId);

  // Get all active students for this semester
  const students = db.prepare('SELECT * FROM students WHERE current_sem = ? AND is_active = 1').all(exam.semester);

  const upsertResult = db.prepare(`
    INSERT INTO student_results (id, exam_id, student_id, total_credits, earned_credits, total_grade_points, sgpa, cgpa, result_status, calculated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(exam_id, student_id) DO UPDATE SET
      total_credits = excluded.total_credits,
      earned_credits = excluded.earned_credits,
      total_grade_points = excluded.total_grade_points,
      sgpa = excluded.sgpa,
      cgpa = excluded.cgpa,
      result_status = excluded.result_status,
      calculated_at = CURRENT_TIMESTAMP
  `);

  const resultsSummary = [];

  try {
    db.transaction(() => {
      students.forEach(student => {
        const courseMarksMap = courses.map(course => {
          const courseComps = components.filter(comp => comp.course_id === course.id).map(comp => {
            const markRow = db.prepare('SELECT marks_obtained, is_absent FROM student_marks WHERE component_id = ? AND student_id = ?').get(comp.id, student.id);
            return {
              component_name: comp.component_name,
              max_marks: comp.max_marks,
              passing_marks: comp.passing_marks,
              marks_obtained: markRow ? markRow.marks_obtained : 0,
              is_absent: markRow ? markRow.is_absent : 0
            };
          });
          return { course, components: courseComps };
        });

        // Compute results
        const calc = calculateStudentResult(courseMarksMap);
        upsertResult.run(
          uuidv4(),
          examId,
          student.id,
          calc.totalCredits,
          calc.earnedCredits,
          calc.totalCreditPoints,
          calc.sgpa,
          calc.cgpa,
          calc.resultStatus
        );

        resultsSummary.push({
          studentId: student.id,
          name: student.name,
          prn: student.prn,
          sgpa: calc.sgpa,
          cgpa: calc.cgpa,
          status: calc.resultStatus
        });
      });
    })();

    res.json({ message: 'Results calculated successfully', totalEvaluated: resultsSummary.length, summary: resultsSummary });
  } catch (err) {
    res.status(500).json({ error: 'Calculation engine failed: ' + err.message });
  }
});

// Publish Results to Learner Portal (Exam Controller, Super Admin)
router.post('/:examId/publish', authenticateToken, requireRole('exam_controller', 'super_admin'), async (req, res) => {
  const { examId } = req.params;

  try {
    db.transaction(() => {
      db.prepare(`
        UPDATE examinations
        SET is_published = 1, is_marks_entry_locked = 1, published_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(examId);

      db.prepare(`
        UPDATE student_results
        SET is_published = 1
        WHERE exam_id = ?
      `).run(examId);
    })();

    // Invalidate edge KV cache for marksheets
    await kv.delete(`marksheet:${examId}`);

    // Broadcast LIVE event to all connected student clients!
    broadcastEvent('MARKSHEET_PUBLISHED', { examId, publishedAt: new Date().toISOString() });

    res.json({ message: 'Examination results officially published. Marksheets are now LIVE for all learners.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish results: ' + err.message });
  }
});

// Get Student Official Live Marksheet / Grade Card (Learner Portal & EduPlus compatibility)
router.get(['/gradecard/:studentId/:examId', '/learner_grade_card_viit'], authenticateToken, enforceStudentIsolation, async (req, res) => {
  const studentId = req.params.studentId || req.query.studentId || (req.user && req.user.studentId);
  const examId = req.params.examId || req.query.examId || db.prepare('SELECT id FROM examinations WHERE is_published = 1 ORDER BY published_at DESC LIMIT 1').get()?.id;

  if (!studentId || !examId) {
    return res.status(400).json({ error: 'Student and Examination identifiers required.' });
  }

  // Check KV cache for ultra fast edge response
  const cacheKey = `student:gradecard:${studentId}:${examId}`;
  const cached = await kv.get(cacheKey, 'json');
  if (cached) {
    return res.json(cached);
  }

  const exam = db.prepare('SELECT * FROM examinations WHERE id = ?').get(examId);
  if (!exam) return res.status(404).json({ error: 'Examination not found' });

  // If student is querying an unpublished exam, block unless staff
  if (!exam.is_published && req.user.userType !== 'staff') {
    return res.status(403).json({ error: 'Results for this examination have not been released yet.' });
  }

  const student = db.prepare(`
    SELECT s.*, p.name as program_name, p.degree, d.name as department_name, c.name as college_name, c.logo_url, c.affiliation
    FROM students s
    LEFT JOIN programs p ON s.program_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE s.id = ?
  `).get(studentId);

  const resultRecord = db.prepare('SELECT * FROM student_results WHERE exam_id = ? AND student_id = ?').get(examId, studentId);

  // Get courses and breakdown
  const courses = db.prepare(`
    SELECT DISTINCT c.id, c.code, c.name, c.credits, c.course_type
    FROM courses c
    JOIN exam_components ec ON c.id = ec.course_id
    WHERE ec.exam_id = ?
  `).all(examId);

  const components = db.prepare('SELECT * FROM exam_components WHERE exam_id = ?').all(examId);

  const courseMarksMap = courses.map(course => {
    const courseComps = components.filter(comp => comp.course_id === course.id).map(comp => {
      const markRow = db.prepare('SELECT marks_obtained, is_absent FROM student_marks WHERE component_id = ? AND student_id = ?').get(comp.id, studentId);
      return {
        component_name: comp.component_name,
        max_marks: comp.max_marks,
        passing_marks: comp.passing_marks,
        marks_obtained: markRow ? markRow.marks_obtained : 0,
        is_absent: markRow ? markRow.is_absent : 0
      };
    });
    return { course, components: courseComps };
  });

  const calculated = calculateStudentResult(courseMarksMap);

  const responsePayload = {
    institution: {
      name: student.college_name,
      affiliation: student.affiliation,
      logoUrl: student.logo_url
    },
    examination: {
      id: exam.id,
      title: exam.title,
      academicYear: exam.academic_year,
      semester: exam.semester,
      examType: exam.exam_type,
      publishedAt: exam.published_at,
      isLive: Boolean(exam.is_published)
    },
    student: {
      id: student.id,
      prn: student.prn,
      rollNo: student.roll_no,
      seatNo: student.seat_no,
      name: student.name,
      program: student.program_name,
      department: student.department_name,
      division: student.division,
      batch: student.batch
    },
    courses: calculated.courses,
    summary: {
      totalCredits: resultRecord ? resultRecord.total_credits : calculated.totalCredits,
      earnedCredits: resultRecord ? resultRecord.earned_credits : calculated.earnedCredits,
      totalCreditPoints: resultRecord ? resultRecord.total_grade_points : calculated.totalCreditPoints,
      sgpa: resultRecord ? resultRecord.sgpa : calculated.sgpa,
      cgpa: resultRecord ? resultRecord.cgpa : calculated.cgpa,
      resultStatus: resultRecord ? resultRecord.result_status : calculated.resultStatus
    },
    antiTamperBarcode: `*${student.prn}-${exam.semester}-${resultRecord?.sgpa || calculated.sgpa}*`
  };

  // Cache in KV for 5 minutes
  await kv.put(cacheKey, responsePayload, { expirationTtl: 300 });

  res.json(responsePayload);
});

// Hall Ticket / Admit Card
router.get(['/hall-ticket/:studentId/:examId', '/getStudentHallTicketBacklog'], authenticateToken, enforceStudentIsolation, (req, res) => {
  const studentId = req.params.studentId || req.query.studentId || (req.user && req.user.studentId);
  const examId = req.params.examId || req.query.examId || db.prepare('SELECT id FROM examinations ORDER BY created_at DESC LIMIT 1').get()?.id;

  const student = db.prepare(`
    SELECT s.*, p.name as program_name, d.name as department_name, c.name as college_name, c.logo_url
    FROM students s
    JOIN programs p ON s.program_id = p.id
    JOIN departments d ON p.department_id = d.id
    JOIN colleges c ON d.college_id = c.id
    WHERE s.id = ?
  `).get(studentId);

  const exam = db.prepare('SELECT * FROM examinations WHERE id = ?').get(examId);
  const courses = db.prepare(`
    SELECT DISTINCT c.code, c.name, c.course_type, ec.component_name
    FROM courses c
    JOIN exam_components ec ON c.id = ec.course_id
    WHERE ec.exam_id = ?
  `).all(examId);

  res.json({
    student,
    exam,
    schedule: courses.map((c, i) => ({
      courseCode: c.code,
      courseName: c.name,
      component: c.component_name,
      date: `2026-10-${String(10 + i * 2).padStart(2, '0')}`,
      time: '10:00 AM - 01:00 PM',
      centre: 'PCCOE Campus Main Building - LH 302'
    }))
  });
});

export default router;
