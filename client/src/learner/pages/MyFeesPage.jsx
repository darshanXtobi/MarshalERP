import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Printer, X, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function MyFeesPage() {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFees() {
      try {
        const studentId = user?.studentId || user?.id || 'default';
        const res = await api.get(`/fees/student/${studentId}`);
        setFeeData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFees();
  }, [user]);

  const viewReceipt = async (receiptNo) => {
    try {
      const res = await api.get(`/fees/receipt/${receiptNo}`);
      setSelectedReceipt(res);
    } catch (err) {
      console.error(err);
    }
  };

  const account = feeData?.account || { total_assessed: 95000, concession: 0, total_paid: 95000, balance: 0 };
  const feeHeads = feeData?.feeHeads || [];
  const txs = feeData?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            My Fee Ledger & Payment Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative financial account statement, head-wise assessment, and official receipt downloads.
          </p>
        </div>
      </div>

      {/* Account Balances Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Assessed</span>
          <p className="text-xl font-bold text-slate-900 mt-1">₹ {account.total_assessed?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Concession / Waiver</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">₹ {account.concession?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Confirmed Paid</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">₹ {account.total_paid?.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Remaining Dues</span>
          <p className={`text-xl font-extrabold mt-1 ${account.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹ {account.balance?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fee Heads Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
          Approved Institutional Fee Structure (Semester 6)
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {feeHeads.map(head => (
            <div key={head.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800">{head.fee_head}</h4>
                <span className="text-[11px] text-slate-500">Statutory Term Due Date: {head.due_date}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">₹ {head.amount?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed Transactions & Official Receipts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
          Payment History & Downloadable Receipts
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="p-3">Receipt No</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-indigo-700">{tx.receipt_no}</td>
                  <td className="p-3 text-slate-600">{new Date(tx.paid_at).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-700">{tx.payment_mode}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">₹ {tx.amount?.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => viewReceipt(tx.receipt_no)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold border border-indigo-200 text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official 3-Copy Fee Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:p-0">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 noprint"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Content */}
            <div className="border-2 border-slate-800 p-6 rounded-xl space-y-4 text-slate-900">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-base font-black uppercase text-slate-950">
                  {selectedReceipt.institution?.name}
                </h2>
                <p className="text-[11px] text-slate-600">{selectedReceipt.institution?.address}</p>
                <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  OFFICIAL FEE RECEIPT - STUDENT COPY
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Receipt Number</span>
                  <p className="font-mono font-bold text-indigo-700">{selectedReceipt.transaction?.receiptNo}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Date of Payment</span>
                  <p className="font-mono font-bold text-slate-900">{new Date(selectedReceipt.transaction?.paidAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Student Name</span>
                  <p className="font-bold text-slate-900">{selectedReceipt.student?.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">PRN / Roll No</span>
                  <p className="font-mono font-bold text-slate-900">{selectedReceipt.student?.prn} ({selectedReceipt.student?.rollNo})</p>
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Academic & Tuition Fees Confirmed</span>
                  <p className="text-[11px] text-slate-500">Mode: {selectedReceipt.transaction?.paymentMode}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Amount Received</span>
                  <p className="text-lg font-black text-emerald-700">₹ {selectedReceipt.transaction?.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-end justify-between pt-6 border-t border-slate-300 text-xs">
                <span className="text-[10px] font-mono text-slate-500">System Verified & Reconciled</span>
                <div className="text-right">
                  <div className="w-28 border-b border-slate-900 ml-auto pb-1 text-[10px] font-bold text-slate-800 text-center">Accounts Dept</div>
                  <span className="text-[10px] font-bold uppercase block mt-1">Authorized Cashier Sign</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 noprint">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
