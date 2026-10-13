import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, AlertCircle, Printer, Plus } from 'lucide-react';
import { api } from '../../services/api';

export default function FeeManagementPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Online');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.get('/students');
        setStudents(res.students || []);
        if (res.students?.length > 0) {
          selectStudent(res.students[0]);
        }
      } catch (err) {
        setErrorMsg('Failed to load student list');
      }
    }
    loadStudents();
  }, []);

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.get(`/fees/student/${student.id}`);
      setFeeData(res);
      setPayAmount(res.account?.balance || '');
    } catch (err) {
      setErrorMsg('Failed to load student fee dues');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !payAmount || Number(payAmount) <= 0) {
      setErrorMsg('Enter a valid payment amount.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/fees/pay', {
        studentId: selectedStudent.id,
        amount: Number(payAmount),
        paymentMode: payMode,
        remarks: remarks || 'Fee Installment Confirmed'
      });
      setSuccessMsg(`Payment of ₹ ${payAmount} recorded successfully! Receipt generated: ${res.receiptNo}`);
      await selectStudent(selectedStudent);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Fee Accounts & Payment Collection
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts & Finance: Record student fee installments, verify bank transactions, and issue official receipts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Student Selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Select Student</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Name or PRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => selectStudent(student)}
                className={`w-full text-left p-3 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedStudent?.id === student.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800">{student.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">PRN: {student.prn} | Roll: {student.roll_no}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Sem {student.current_sem}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Fee Dossier & Payment Entry */}
        <div className="lg:col-span-2 space-y-4">
          {feeData && (
            <>
              {/* Account Dues Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Assessed Fees</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">₹ {feeData.account?.total_assessed?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Concession</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">₹ {feeData.account?.concession?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">₹ {feeData.account?.total_paid?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Due</p>
                  <p className={`text-lg font-extrabold mt-1 ${feeData.account?.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₹ {feeData.account?.balance?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Record Payment Form */}
              <form onSubmit={handleRecordPayment} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Record Payment for {selectedStudent?.name} (PRN: {selectedStudent?.prn})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount to Pay (₹)</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Mode</label>
                    <select
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                    >
                      <option value="Online">Online Payment Gateway</option>
                      <option value="Cash">Cash (Counter)</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="NEFT">NEFT / RTGS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks / Note</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Installment 2"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || Number(feeData.account?.balance) <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Processing...' : 'Confirm Payment & Issue Receipt'}</span>
                  </button>
                </div>
              </form>

              {/* Transactions History */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
                  Confirmed Receipts & Transactions
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Receipt No</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3 text-right">Amount Paid</th>
                        <th className="p-3 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeData.transactions?.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-indigo-600">{tx.receipt_no}</td>
                          <td className="p-3 text-slate-500">{new Date(tx.paid_at).toLocaleDateString()}</td>
                          <td className="p-3 font-medium text-slate-700">{tx.payment_mode}</td>
                          <td className="p-3 text-right font-bold text-slate-900">₹ {tx.amount?.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Confirmed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
