import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';
import { calculateStudentResult } from '../services/gradingEngine.js';

console.log('--- SEEDING MARSHAL ERP DATABASE ---');

const passwordHash = bcrypt.hashSync('admin123', 10);
const studentPasswordHash = bcrypt.hashSync('student123', 10);

db.transaction(() => {
  // Clear existing records in proper order
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM grievances;
    DELETE FROM notices;
    DELETE FROM timetables;
    DELETE FROM student_transport;
    DELETE FROM transport_stops;
    DELETE FROM transport_routes;
    DELETE FROM fee_transactions;
    DELETE FROM student_fee_accounts;
    DELETE FROM fee_structures;
    DELETE FROM student_results;
    DELETE FROM student_marks;
    DELETE FROM exam_components;
    DELETE FROM examinations;
    DELETE FROM attendance_records;
    DELETE FROM attendance_sessions;
    DELETE FROM faculty_course_assignments;
    DELETE FROM courses;
    DELETE FROM students;
    DELETE FROM programs;
    DELETE FROM users;
    DELETE FROM departments;
    DELETE FROM colleges;
  `);

  // 1. College
  const collegeId = uuidv4();
  db.prepare(`
    INSERT INTO colleges (id, code, name, affiliation, logo_url, address, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    collegeId,
    'PCCOE-ERP',
    'Pimpri Chinchwad College of Engineering & Autonomous Institute',
    'Affiliated to Savitribai Phule Pune University (SPPU) & AICTE Approved',
    'https://www.edupluscampus.com/img/logos/favicon.png',
    'Sector 26, Pradhikaran, Nigdi, Pune, Maharashtra 411044',
    '+91-20-27653168',
    'admin@pccoepune.org'
  );

  // 2. Department
  const deptId = uuidv4();
  db.prepare(`
    INSERT INTO departments (id, college_id, code, name)
    VALUES (?, ?, ?, ?)
  `).run(deptId, collegeId, 'COMP', 'Department of Computer Engineering');

  // 3. Staff Users
  const users = [
    { id: uuidv4(), username: 'admin', email: 'admin@college.edu', name: 'Dr. Suresh Patil (Super Admin)', role: 'super_admin' },
    { id: uuidv4(), username: 'principal', email: 'principal@college.edu', name: 'Dr. Govind N. Kulkarni (Principal)', role: 'principal' },
    { id: uuidv4(), username: 'examcontroller', email: 'controller@college.edu', name: 'Prof. Ramesh Kadam (Controller of Examinations)', role: 'exam_controller' },
    { id: uuidv4(), username: 'hod_cs', email: 'hod_comp@college.edu', name: 'Dr. Anuradha Thakare (HOD Computer)', role: 'hod' },
    { id: uuidv4(), username: 'faculty1', email: 'faculty1@college.edu', name: 'Prof. Rajesh Sharma (Assistant Professor)', role: 'faculty' },
    { id: uuidv4(), username: 'faculty2', email: 'faculty2@college.edu', name: 'Prof. Priya Deshpande (Assistant Professor)', role: 'faculty' },
    { id: uuidv4(), username: 'accounts', email: 'accounts@college.edu', name: 'Mr. Arvind Shinde (Accounts Officer)', role: 'accounts' },
    { id: uuidv4(), username: 'transport', email: 'transport@college.edu', name: 'Mr. Mahendra Joshi (Transport Head)', role: 'transport' }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, display_name, role, department_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  users.forEach(u => insertUser.run(u.id, u.username, u.email, passwordHash, u.name, u.role, deptId));

  // 4. Program
  const progId = uuidv4();
  db.prepare(`
    INSERT INTO programs (id, department_id, code, name, degree, total_semesters)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(progId, deptId, 'BTECH-CS', 'Bachelor of Technology in Computer Engineering', 'B.Tech', 8);

  // 5. Courses (Semester 6)
  const coursesData = [
    { id: uuidv4(), code: 'CS601', name: 'Advanced Algorithms & Complexity', credits: 4.0, type: 'Theory', intMax: 30, extMax: 70 },
    { id: uuidv4(), code: 'CS602', name: 'Cloud Computing & Distributed Systems', credits: 4.0, type: 'Theory', intMax: 30, extMax: 70 },
    { id: uuidv4(), code: 'CS603', name: 'Information & Cyber Security', credits: 3.0, type: 'Theory', intMax: 30, extMax: 70 },
    { id: uuidv4(), code: 'CS604', name: 'Machine Learning & Applications', credits: 3.0, type: 'Theory', intMax: 30, extMax: 70 },
    { id: uuidv4(), code: 'CS605L', name: 'Cloud & Security Laboratory', credits: 2.0, type: 'Practical', intMax: 20, extMax: 30 },
    { id: uuidv4(), code: 'CS606P', name: 'Capstone Mini Project - II', credits: 2.0, type: 'Project', intMax: 25, extMax: 25 }
  ];

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, program_id, semester, code, name, credits, course_type, internal_max, external_max, total_max, passing_percentage)
    VALUES (?, ?, 6, ?, ?, ?, ?, ?, ?, ?, 40.0)
  `);
  coursesData.forEach(c => insertCourse.run(c.id, progId, c.code, c.name, c.credits, c.type, c.intMax, c.extMax, c.intMax + c.extMax));

  // 6. Faculty Course Assignment
  const faculty1 = users.find(u => u.username === 'faculty1');
  const faculty2 = users.find(u => u.username === 'faculty2');
  const insertAssign = db.prepare(`
    INSERT INTO faculty_course_assignments (id, faculty_id, course_id, division, academic_year, semester)
    VALUES (?, ?, ?, 'A', '2025-2026', 6)
  `);
  insertAssign.run(uuidv4(), faculty1.id, coursesData[0].id);
  insertAssign.run(uuidv4(), faculty1.id, coursesData[1].id);
  insertAssign.run(uuidv4(), faculty2.id, coursesData[2].id);
  insertAssign.run(uuidv4(), faculty2.id, coursesData[3].id);

  // 7. Students (Including user's PRN: 121B1G148)
  const studentsData = [
    { id: uuidv4(), prn: '121B1G148', roll: 'CS-401', name: 'Darshan Dalvi', email: 'darshan.dalvi@student.pccoepune.org', seat: 'T190058201', blood: 'O+', phone: '+91-9876543210', address: 'Plot 42, Sector 27, Nigdi, Pune 411044' },
    { id: uuidv4(), prn: '121B1G149', roll: 'CS-402', name: 'Aarav Mehta', email: 'aarav.mehta@student.pccoepune.org', seat: 'T190058202', blood: 'B+', phone: '+91-9876543211', address: 'A-12, Baner Heights, Pune 411045' },
    { id: uuidv4(), prn: '121B1G150', roll: 'CS-403', name: 'Pooja Deshmukh', email: 'pooja.deshmukh@student.pccoepune.org', seat: 'T190058203', blood: 'A+', phone: '+91-9876543212', address: 'Flat 304, Wakad Woods, Pune 411057' },
    { id: uuidv4(), prn: '121B1G151', roll: 'CS-404', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@student.pccoepune.org', seat: 'T190058204', blood: 'AB+', phone: '+91-9876543213', address: 'B-7, Kothrud Pride, Pune 411038' },
    { id: uuidv4(), prn: '121B1G152', roll: 'CS-405', name: 'Neha Verma', email: 'neha.verma@student.pccoepune.org', seat: 'T190058205', blood: 'O-', phone: '+91-9876543214', address: 'Row House 3, Pimple Saudagar, Pune 411027' }
  ];

  const insertStudent = db.prepare(`
    INSERT INTO students (id, prn, roll_no, seat_no, name, email, password_hash, program_id, current_sem, division, batch, academic_year, gender, blood_group, phone, parent_phone, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 6, 'A', 'B1', '2025-2026', 'Male', ?, ?, '+91-9123456789', ?)
  `);
  studentsData.forEach(s => insertStudent.run(s.id, s.prn, s.roll, s.seat, s.name, s.email, studentPasswordHash, progId, s.blood, s.phone, s.address));

  // 8. Attendance Sessions and Student Presence
  const insertSession = db.prepare(`
    INSERT INTO attendance_sessions (id, course_id, faculty_id, semester, division, session_date, period_no, topic_delivered)
    VALUES (?, ?, ?, 6, 'A', ?, ?, ?)
  `);
  const insertAttRecord = db.prepare(`
    INSERT INTO attendance_records (id, session_id, student_id, status)
    VALUES (?, ?, ?, ?)
  `);

  const dates = ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-08', '2026-09-10', '2026-09-12', '2026-09-15', '2026-09-17', '2026-09-19', '2026-09-22'];
  coursesData.forEach((course, cIdx) => {
    dates.forEach((date, dIdx) => {
      const sessionId = uuidv4();
      const facId = cIdx % 2 === 0 ? faculty1.id : faculty2.id;
      insertSession.run(sessionId, course.id, facId, date, (dIdx % 6) + 1, `Unit ${(dIdx % 3) + 1}: Topic lecture details`);

      studentsData.forEach((student, sIdx) => {
        // High attendance for student 1 (Darshan Dalvi) ~ 90%
        let status = 'Present';
        if (sIdx === 0 && dIdx === 3) status = 'Absent';
        else if (sIdx === 3 && dIdx % 2 === 1) status = 'Absent'; // Student 4 lower attendance
        else if (dIdx === 7 && sIdx % 2 === 1) status = 'Absent';
        insertAttRecord.run(uuidv4(), sessionId, student.id, status);
      });
    });
  });

  // 9. Examinations
  const examId = uuidv4();
  db.prepare(`
    INSERT INTO examinations (id, title, academic_year, semester, exam_type, start_date, end_date, is_marks_entry_locked, is_published, published_at)
    VALUES (?, ?, '2025-2026', 6, 'Regular', '2026-10-01', '2026-10-15', 1, 1, CURRENT_TIMESTAMP)
  `).run(examId, 'End Semester Autonomous Examination (May-June 2026)');

  // 10. Exam Components
  const examComponents = [];
  const insertComp = db.prepare(`
    INSERT INTO exam_components (id, exam_id, course_id, component_name, max_marks, passing_marks, weightage_percent)
    VALUES (?, ?, ?, ?, ?, ?, 100)
  `);

  coursesData.forEach(c => {
    if (c.type === 'Theory') {
      const iseId = uuidv4();
      const eseId = uuidv4();
      insertComp.run(iseId, examId, c.id, 'ISE', 30, 12);
      insertComp.run(eseId, examId, c.id, 'ESE', 70, 28);
      examComponents.push({ id: iseId, courseId: c.id, name: 'ISE', max: 30, pass: 12, course: c });
      examComponents.push({ id: eseId, courseId: c.id, name: 'ESE', max: 70, pass: 28, course: c });
    } else {
      const prId = uuidv4();
      insertComp.run(prId, examId, c.id, c.type === 'Practical' ? 'PR' : 'TW', 50, 20);
      examComponents.push({ id: prId, courseId: c.id, name: c.type === 'Practical' ? 'PR' : 'TW', max: 50, pass: 20, course: c });
    }
  });

  // 11. Student Marks
  const insertMark = db.prepare(`
    INSERT INTO student_marks (id, component_id, student_id, marks_obtained, is_absent, entered_by)
    VALUES (?, ?, ?, ?, 0, ?)
  `);

  // Scores profile for students
  const scoreProfiles = [
    { isePct: 0.88, esePct: 0.85, labPct: 0.92 }, // Darshan: Excellent
    { isePct: 0.78, esePct: 0.75, labPct: 0.84 }, // Aarav: Very Good
    { isePct: 0.94, esePct: 0.92, labPct: 0.96 }, // Pooja: Outstanding
    { isePct: 0.62, esePct: 0.58, labPct: 0.70 }, // Rohan: Average
    { isePct: 0.70, esePct: 0.72, labPct: 0.80 }  // Neha: Good
  ];

  studentsData.forEach((student, sIdx) => {
    const prof = scoreProfiles[sIdx];
    examComponents.forEach(comp => {
      let mark = 0;
      if (comp.name === 'ISE') mark = Math.round(comp.max * prof.isePct);
      else if (comp.name === 'ESE') mark = Math.round(comp.max * prof.esePct);
      else mark = Math.round(comp.max * prof.labPct);
      insertMark.run(uuidv4(), comp.id, student.id, mark, faculty1.id);
    });
  });

  // 12. Pre-calculate and Save Results via Official Grading Engine
  const insertResult = db.prepare(`
    INSERT INTO student_results (id, exam_id, student_id, total_credits, earned_credits, total_grade_points, sgpa, cgpa, result_status, is_published, calculated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
  `);

  studentsData.forEach(student => {
    // Structure data for engine
    const courseMarksMap = coursesData.map(c => {
      const comps = examComponents.filter(ec => ec.courseId === c.id).map(ec => {
        const markRow = db.prepare('SELECT marks_obtained, is_absent FROM student_marks WHERE component_id = ? AND student_id = ?').get(ec.id, student.id);
        return {
          component_name: ec.name,
          max_marks: ec.max,
          passing_marks: ec.pass,
          marks_obtained: markRow ? markRow.marks_obtained : 0,
          is_absent: markRow ? markRow.is_absent : 0
        };
      });
      return { course: c, components: comps };
    });

    // Mock prior semesters: Sem 1 to 5 with solid SGPA
    const priorSems = [
      { semester: 1, credits: 20, sgpa: 8.5 },
      { semester: 2, credits: 20, sgpa: 8.7 },
      { semester: 3, credits: 22, sgpa: 8.6 },
      { semester: 4, credits: 22, sgpa: 8.8 },
      { semester: 5, credits: 20, sgpa: 8.9 }
    ];

    const result = calculateStudentResult(courseMarksMap, priorSems);
    insertResult.run(
      uuidv4(),
      examId,
      student.id,
      result.totalCredits,
      result.earnedCredits,
      result.totalCreditPoints,
      result.sgpa,
      result.cgpa,
      result.resultStatus
    );
  });

  // 13. Fee Structures, Accounts & Transactions
  const feeHeads = [
    { head: 'Tuition Fee', amt: 75000.0, date: '2026-08-31' },
    { head: 'Development Fee', amt: 15000.0, date: '2026-08-31' },
    { head: 'Examination & Gymkhana Fee', amt: 5000.0, date: '2026-09-15' }
  ];
  const insertFeeHead = db.prepare(`
    INSERT INTO fee_structures (id, program_id, academic_year, semester, fee_head, amount, due_date)
    VALUES (?, ?, '2025-2026', 6, ?, ?, ?)
  `);
  feeHeads.forEach(f => insertFeeHead.run(uuidv4(), progId, f.head, f.amt, f.date));

  const totalAssessed = 95000.0;
  const insertFeeAcc = db.prepare(`
    INSERT INTO student_fee_accounts (id, student_id, academic_year, semester, total_assessed, concession, total_paid, balance)
    VALUES (?, ?, '2025-2026', 6, ?, ?, ?, ?)
  `);
  const insertFeeTx = db.prepare(`
    INSERT INTO fee_transactions (id, student_id, receipt_no, amount, payment_mode, transaction_ref, remarks, received_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  studentsData.forEach((student, idx) => {
    let paid = 95000.0;
    let balance = 0.0;
    let concession = 0.0;
    if (idx === 1) { // Partial payment
      paid = 50000.0;
      balance = 45000.0;
    } else if (idx === 4) { // Scholarship concession
      concession = 20000.0;
      paid = 75000.0;
      balance = 0.0;
    }

    insertFeeAcc.run(uuidv4(), student.id, totalAssessed, concession, paid, balance);
    insertFeeTx.run(
      uuidv4(),
      student.id,
      `REC-2026-${String(420 + idx).padStart(5, '0')}`,
      paid,
      'Online Payment Gateway',
      `TXN_SBI_${Date.now()}_${idx}`,
      'Sem 6 Academic & Tuition Fee Installment Confirmed',
      users.find(u => u.role === 'accounts').id
    );
  });

  // 14. Transport Routes & Allocations
  const route1Id = uuidv4();
  const route2Id = uuidv4();
  db.prepare(`
    INSERT INTO transport_routes (id, route_name, vehicle_no, driver_name, driver_phone, annual_fee)
    VALUES (?, 'Route 1: Kothrud - Chandani Chowk - Campus Express', 'MH-14-AZ-4521', 'Mr. Dattatray Shinde', '+91-9822334455', 18000.0)
  `).run(route1Id);
  db.prepare(`
    INSERT INTO transport_routes (id, route_name, vehicle_no, driver_name, driver_phone, annual_fee)
    VALUES (?, 'Route 2: Hadapsar - Magarpatta - Hinjawadi - Campus', 'MH-14-BT-8942', 'Mr. Tukaram Patil', '+91-9822334456', 22000.0)
  `).run(route2Id);

  const stop1Id = uuidv4();
  db.prepare(`
    INSERT INTO transport_stops (id, route_id, stop_name, pickup_time, drop_time, stop_order)
    VALUES (?, ?, 'Chandani Chowk Metro Station', '07:35 AM', '05:45 PM', 1)
  `).run(stop1Id, route1Id);

  // Allocate Route 1 to Student 1 (Darshan Dalvi)
  db.prepare(`
    INSERT INTO student_transport (id, student_id, route_id, stop_id, bus_pass_no, academic_year, status)
    VALUES (?, ?, ?, ?, 'BP-PCCOE-2026-089', '2025-2026', 'Active')
  `).run(uuidv4(), studentsData[0].id, route1Id, stop1Id);

  // 15. Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const insertTT = db.prepare(`
    INSERT INTO timetables (id, program_id, semester, division, day_of_week, period_no, start_time, end_time, course_id, faculty_id, room_no)
    VALUES (?, ?, 6, 'A', ?, ?, ?, ?, ?, ?, ?)
  `);
  days.forEach((day, dIdx) => {
    insertTT.run(uuidv4(), progId, day, 1, '09:00 AM', '10:00 AM', coursesData[0].id, faculty1.id, 'LH-302');
    insertTT.run(uuidv4(), progId, day, 2, '10:00 AM', '11:00 AM', coursesData[1].id, faculty1.id, 'LH-302');
    insertTT.run(uuidv4(), progId, day, 3, '11:15 AM', '12:15 PM', coursesData[2].id, faculty2.id, 'LH-302');
    insertTT.run(uuidv4(), progId, day, 4, '01:00 PM', '03:00 PM', coursesData[4].id, faculty2.id, 'Lab 7 (Cloud)');
  });

  // 16. Notices
  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, category, content, target_role, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNotice.run(
    uuidv4(),
    'Autonomous Examination Marksheets Published for Semester 6',
    'Examination',
    'Dear Students, the official SGPA/CGPA evaluation and semester 6 marksheets have been verified by the Controller of Examinations and are now live in the student portal. You may download your verified grade card.',
    'all',
    users.find(u => u.role === 'exam_controller').id
  );
  insertNotice.run(
    uuidv4(),
    'Campus Placement Drive: Google, Microsoft & TCS Digital Registration',
    'Academic',
    'Eligible students having CGPA >= 7.5 with zero active backlogs must submit their updated resume and placement consent by Friday.',
    'students',
    users.find(u => u.role === 'hod').id
  );

  // 17. Grievance
  db.prepare(`
    INSERT INTO grievances (id, student_id, ticket_no, category, subject, description, status, resolution, resolved_by, resolved_at)
    VALUES (?, ?, 'TKT-2026-0089', 'Examination', 'Inquiry regarding Practical exam mark verification', 'Kindly verify the practical lab credits for CS605L.', 'Resolved', 'Verified with department laboratory records. Credits and marks are correct.', ?, CURRENT_TIMESTAMP)
  `).run(uuidv4(), studentsData[0].id, faculty1.id);
})();

console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
