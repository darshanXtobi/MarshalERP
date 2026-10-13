import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken, requireRole, enforceStudentIsolation } from '../middleware/auth.js';

const router = express.Router();

// List Fee Structures
router.get('/structures', authenticateToken, (req, res) => {
  const structures = db.prepare(`
    SELECT fs.*, p.name as program_name
    FROM fee_structures fs
    JOIN programs p ON fs.program_id = p.id
    ORDER BY fs.academic_year DESC, fs.semester ASC
  `).all();
  res.json({ structures });
});

// Get Student Fee Account, Dues & Payment History
router.get(['/student/:studentId', '/my-dues'], authenticateToken, enforceStudentIsolation, (req, res) => {
  const studentId = req.params.studentId || (req.user && req.user.studentId);
  if (!studentId) return res.status(400).json({ error: 'Student ID required.' });

  const student = db.prepare('SELECT id, prn, roll_no, name, program_id, current_sem FROM students WHERE id = ?').get(studentId);
  const account = db.prepare('SELECT * FROM student_fee_accounts WHERE student_id = ? ORDER BY academic_year DESC LIMIT 1').get(studentId);
  const feeHeads = db.prepare('SELECT * FROM fee_structures WHERE program_id = ? AND semester = ?').all(student.program_id, student.current_sem);
  const transactions = db.prepare('SELECT * FROM fee_transactions WHERE student_id = ? ORDER BY paid_at DESC').all(studentId);

  res.json({
    student,
    account: account || { total_assessed: 95000, concession: 0, total_paid: 0, balance: 95000 },
    feeHeads,
    transactions
  });
});

// Record Fee Payment (Accounts Admin)
router.post('/pay', authenticateToken, requireRole('accounts', 'super_admin'), (req, res) => {
  const { studentId, amount, paymentMode, transactionRef, remarks } = req.body;
  const payAmt = Number(amount);

  if (!studentId || !payAmt || payAmt <= 0) {
    return res.status(400).json({ error: 'Valid student ID and positive payment amount required.' });
  }

  const receiptNo = `REC-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
  const receivedBy = req.user.id;

  try {
    db.transaction(() => {
      // 1. Insert transaction
      db.prepare(`
        INSERT INTO fee_transactions (id, student_id, receipt_no, amount, payment_mode, transaction_ref, remarks, received_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), studentId, receiptNo, payAmt, paymentMode || 'Online', transactionRef || `REF_${Date.now()}`, remarks || 'Academic Fee Payment', receivedBy);

      // 2. Update student account balance
      db.prepare(`
        UPDATE student_fee_accounts
        SET total_paid = total_paid + ?,
            balance = balance - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(payAmt, payAmt, studentId);
    })();

    res.json({ message: 'Payment recorded successfully', receiptNo, amount: payAmt });
  } catch (err) {
    res.status(500).json({ error: 'Payment recording failed: ' + err.message });
  }
});

// Get Printable Official Fee Receipt
router.get(['/receipt/:receiptNo', '/admissionreceipt'], authenticateToken, (req, res) => {
  const receiptNo = req.params.receiptNo || req.query.receiptNo;
  if (!receiptNo) return res.status(400).json({ error: 'Receipt number required.' });

  const tx = db.prepare(`
    SELECT ft.*, s.name as student_name, s.prn, s.roll_no, s.current_sem, s.division,
           p.name as program_name, c.name as college_name, c.logo_url, c.address as college_address
    FROM fee_transactions ft
    JOIN students s ON ft.student_id = s.id
    JOIN programs p ON s.program_id = p.id
    JOIN departments d ON p.department_id = d.id
    JOIN colleges c ON d.college_id = c.id
    WHERE ft.receipt_no = ?
  `).get(receiptNo);

  if (!tx) return res.status(404).json({ error: 'Receipt not found.' });

  res.json({
    receipt: tx,
    institution: {
      name: tx.college_name,
      address: tx.college_address,
      logoUrl: tx.logo_url
    },
    student: {
      name: tx.student_name,
      prn: tx.prn,
      rollNo: tx.roll_no,
      semester: tx.current_sem,
      division: tx.division,
      program: tx.program_name
    },
    transaction: {
      receiptNo: tx.receipt_no,
      amount: tx.amount,
      paymentMode: tx.payment_mode,
      transactionRef: tx.transaction_ref,
      paidAt: tx.paid_at,
      remarks: tx.remarks
    }
  });
});

export default router;
