import { describe, it } from 'node:test';
import assert from 'node:assert';
import db from '../db/database.js';
import { calculateStudentResult, getGradeForPercentage } from '../services/gradingEngine.js';
import { generateToken } from '../middleware/auth.js';

describe('MarshalERP - Backend Engine & Academic Logic Tests', () => {

  it('TEST E1: Official Grade Scale & Boundary Rules', () => {
    assert.strictEqual(getGradeForPercentage(95).grade, 'O');
    assert.strictEqual(getGradeForPercentage(90).grade, 'O');
    assert.strictEqual(getGradeForPercentage(89.9).grade, 'A+');
    assert.strictEqual(getGradeForPercentage(80).grade, 'A+');
    assert.strictEqual(getGradeForPercentage(75).grade, 'A');
    assert.strictEqual(getGradeForPercentage(65).grade, 'B+');
    assert.strictEqual(getGradeForPercentage(56).grade, 'B');
    assert.strictEqual(getGradeForPercentage(52).grade, 'C');
    assert.strictEqual(getGradeForPercentage(41).grade, 'P');
    assert.strictEqual(getGradeForPercentage(39.9).grade, 'F');
    assert.strictEqual(getGradeForPercentage(85, true).grade, 'Ab'); // Absent
  });

  it('TEST E2: SGPA Calculation Verified Against Official Specification', () => {
    // Test Case from MARKS_GRADING_RULES.md:
    // Course 1 (4 Cr): 85% -> A+ (9) -> 36
    // Course 2 (4 Cr): 75% -> A  (8) -> 32
    // Course 3 (3 Cr): 65% -> B+ (7) -> 21
    // Course 4 (3 Cr): 92% -> O  (10)-> 30
    // Course 5 (2 Cr): 88% -> A+ (9) -> 18
    // Course 6 (2 Cr): 95% -> O  (10)-> 20
    // Total Credits = 18, Total Points = 157, Expected SGPA = 157/18 = 8.72
    const mockCourses = [
      { course: { id: '1', code: 'C1', credits: 4 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 85 }] },
      { course: { id: '2', code: 'C2', credits: 4 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 75 }] },
      { course: { id: '3', code: 'C3', credits: 3 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 65 }] },
      { course: { id: '4', code: 'C4', credits: 3 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 92 }] },
      { course: { id: '5', code: 'C5', credits: 2 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 88 }] },
      { course: { id: '6', code: 'C6', credits: 2 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 95 }] }
    ];

    const result = calculateStudentResult(mockCourses);
    assert.strictEqual(result.totalCredits, 18);
    assert.strictEqual(result.earnedCredits, 18);
    assert.strictEqual(result.totalCreditPoints, 157);
    assert.strictEqual(result.sgpa, 8.72);
    assert.strictEqual(result.resultStatus, 'PASS');
  });

  it('TEST E3: Backlog / ATKT Handling', () => {
    // Failing 1 course
    const mockCourses = [
      { course: { id: '1', code: 'C1', credits: 4 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 85 }] },
      { course: { id: '2', code: 'C2', credits: 4 }, components: [{ max_marks: 100, passing_marks: 40, marks_obtained: 32 }] } // FAILED
    ];
    const result = calculateStudentResult(mockCourses);
    assert.strictEqual(result.earnedCredits, 4);
    assert.strictEqual(result.resultStatus, 'ATKT');
  });

  it('TEST D1: Database Integrity - Student 121B1G148 Exists with Records', () => {
    const student = db.prepare('SELECT * FROM students WHERE prn = ?').get('121B1G148');
    assert.ok(student, 'Student Darshan Dalvi must exist in database');
    assert.strictEqual(student.roll_no, 'CS-401');

    // Verify Attendance records
    const attCount = db.prepare('SELECT COUNT(*) as c FROM attendance_records WHERE student_id = ?').get(student.id);
    assert.ok(attCount.c > 0, 'Must have attendance records');

    // Verify Published Marksheet
    const result = db.prepare('SELECT * FROM student_results WHERE student_id = ?').get(student.id);
    assert.ok(result, 'Must have student result record');
    assert.ok(result.sgpa >= 7.0, 'SGPA must be calculated and valid');
    assert.strictEqual(result.is_published, 1);
  });

  it('TEST G1: Fee Ledger Reconciliation', () => {
    const student = db.prepare('SELECT * FROM students WHERE prn = ?').get('121B1G148');
    const feeAcc = db.prepare('SELECT * FROM student_fee_accounts WHERE student_id = ?').get(student.id);
    assert.ok(feeAcc, 'Fee account must exist');
    assert.strictEqual(feeAcc.total_assessed, feeAcc.total_paid + feeAcc.concession + feeAcc.balance);

    const tx = db.prepare('SELECT * FROM fee_transactions WHERE student_id = ?').all(student.id);
    assert.ok(tx.length > 0, 'Transactions must exist');
  });

  it('TEST H1: Transport Route Allocation', () => {
    const student = db.prepare('SELECT * FROM students WHERE prn = ?').get('121B1G148');
    const busPass = db.prepare('SELECT * FROM student_transport WHERE student_id = ?').get(student.id);
    assert.ok(busPass, 'Student must have allocated bus pass');
    assert.ok(busPass.bus_pass_no.startsWith('BP-PCCOE-'));
  });

});
