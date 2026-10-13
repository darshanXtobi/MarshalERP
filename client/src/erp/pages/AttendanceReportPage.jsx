import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { api } from '../../services/api';

export default function AttendanceReportPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/attendance/report?division=A');
        setReport(res.report || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const shortageList = report.filter(r => r.shortage);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Division Attendance Analytics & Shortage Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional minimum requirement: 75% lecture presence. Students below threshold are flagged for parent notification.
          </p>
        </div>

        <div className="bg-amber-50 text-amber-800 px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Shortage Alerts: {shortageList.length} Student(s)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
          Division A - Cumulative Attendance Standings
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">PRN</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Conducted</th>
                <th className="p-3 text-center">Attended</th>
                <th className="p-3 text-center">Percentage</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {report.map(r => (
                <tr key={r.student_id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{r.roll_no}</td>
                  <td className="p-3 font-mono text-indigo-600">{r.prn}</td>
                  <td className="p-3 font-bold text-slate-800">{r.name}</td>
                  <td className="p-3 text-center font-mono">{r.total_conducted}</td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">{r.total_attended}</td>
                  <td className="p-3 text-center font-mono font-extrabold text-sm">
                    <span className={r.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                      {r.percentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.percentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {r.percentage >= 75 ? 'ELIGIBLE' : 'DEBARRED / SHORTAGE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
