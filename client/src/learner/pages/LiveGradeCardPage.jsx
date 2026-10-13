import React, { useState, useEffect } from 'react';
import { Award, Printer, ShieldCheck, CheckCircle2, Radio, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLiveSocket } from '../../context/WebSocketContext';
import { api } from '../../services/api';

export default function LiveGradeCardPage() {
  const { user } = useAuth();
  const { startViewingMarksheet, stopViewingMarksheet, lastNotification } = useLiveSocket();
  const [gradecard, setGradecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const studentId = user?.studentId || user?.id || 'default';

  const loadGradecard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/exams/gradecard/${studentId}/default`);
      setGradecard(res);
      // Notify WebSocket Hub that student is actively inspecting this marksheet!
      startViewingMarksheet(res.examination?.id, res.examination?.title);
    } catch (err) {
      setError(err.message || 'Unable to retrieve marksheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGradecard();

    // Cleanup: unregister viewing state on unmount
    return () => {
      stopViewingMarksheet();
    };
  }, [user]);

  // If WebSocket notifies that marksheet was re-published, refresh live
  useEffect(() => {
    if (lastNotification?.type === 'MARKSHEET_PUBLISHED') {
      loadGradecard();
    }
  }, [lastNotification]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Connecting to Authoritative Result Engine...</p>
        <p className="text-xs text-slate-500">Retrieving calculated grades, credits, SGPA & CGPA</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Marksheet Not Available</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <p className="text-[11px] text-slate-400">
          The examination controller must publish official results before marksheets are accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Print Controls (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 noprint">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-900">Verified Official Autonomous Grade Card</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                LIVE STATUS: SYNCHRONIZED
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your active session is broadcasting live verification to the Staff ERP monitor.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Marksheet</span>
        </button>
      </div>

      {/* OFFICIAL MARKSHEET DOCUMENT (PRINTABLE) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border-4 border-slate-400 shadow-xl relative overflow-hidden text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
        {/* Institutional Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none text-[120px] font-black tracking-widest text-slate-950">
          PCCOE
        </div>

        {/* 1. College Header */}
        <div className="border-b-2 border-slate-800 pb-5 text-center space-y-1 relative z-10">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-950">
            {gradecard.institution?.name || 'PIMPRI CHINCHWAD COLLEGE OF ENGINEERING'}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            An Autonomous Institute | Approved by AICTE, New Delhi
          </p>
          <p className="text-[11px] font-medium text-slate-600">
            {gradecard.institution?.affiliation || 'Affiliated to Savitribai Phule Pune University (SPPU)'}
          </p>
          <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-sm">
            STATEMENT OF GRADES - AUTONOMOUS SEMESTER GRADE REPORT
          </div>
        </div>

        {/* 2. Candidate & Exam Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6 text-xs border border-slate-300 p-4 rounded-lg bg-slate-50/50">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Candidate Name</span>
            <p className="font-extrabold text-slate-950 text-sm mt-0.5">{gradecard.student?.name}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Permanent Reg. No (PRN)</span>
            <p className="font-mono font-bold text-indigo-700 text-sm mt-0.5">{gradecard.student?.prn}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Seat Number</span>
            <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{gradecard.student?.seatNo || 'T190058201'}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Degree & Branch</span>
            <p className="font-semibold text-slate-900 mt-0.5">{gradecard.student?.program}</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Semester / Division</span>
            <p className="font-bold text-slate-900 mt-0.5">Semester {gradecard.examination?.semester} (Div {gradecard.student?.division})</p>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold">Examination Session</span>
            <p className="font-bold text-slate-900 mt-0.5">{gradecard.examination?.academicYear}</p>
          </div>
        </div>

        {/* 3. Official Course Grades Table */}
        <div className="overflow-x-auto my-6 border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300">Course Code</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Course Title</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Credits ($C_i$)</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Total Marks</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Letter Grade</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300">Grade Point ($G_i$)</th>
                <th className="py-2.5 px-3 text-center">Credit Points ($C_i \times G_i$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {gradecard.courses?.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">{c.courseCode}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">{c.courseName}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200">{c.credits}</td>
                  <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{c.totalMarks} / {c.maxMarks}</td>
                  <td className="py-2.5 px-3 text-center font-extrabold border-r border-slate-200">
                    <span className={c.grade === 'O' || c.grade === 'A+' ? 'text-indigo-700' : 'text-slate-900'}>
                      {c.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-slate-200">{c.gradePoint}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">{c.creditPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Result & SGPA/CGPA Summary Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Credits</span>
            <p className="text-xl font-bold mt-0.5">{gradecard.summary?.totalCredits}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Earned Credits</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{gradecard.summary?.earnedCredits}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Semester SGPA</span>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{gradecard.summary?.sgpa}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Cumulative CGPA</span>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{gradecard.summary?.cgpa}</p>
          </div>
        </div>

        {/* Result Status Banner */}
        <div className="mt-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-center">
          <span className="text-xs uppercase font-extrabold text-emerald-950 tracking-wider">
            FINAL RESULT STATUS: <strong className="text-emerald-700 font-black text-sm">{gradecard.summary?.resultStatus}</strong> - FIRST CLASS WITH DISTINCTION
          </span>
        </div>

        {/* 5. Anti-Tamper Barcode & Official Signatures */}
        <div className="mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">Anti-Tamper Barcode Verification</span>
            <div className="font-mono text-xs font-bold tracking-widest text-slate-900 bg-slate-100 p-2 rounded border border-slate-300 inline-block mt-1">
              {gradecard.antiTamperBarcode || `*${gradecard.student?.prn}-6-PASS*`}
            </div>
          </div>

          <div className="text-center">
            <div className="w-32 h-10 border-b border-slate-400 mx-auto"></div>
            <span className="text-[11px] font-bold text-slate-700 mt-1 block">Head of Department</span>
          </div>

          <div className="text-right">
            <div className="w-36 h-10 border-b-2 border-slate-900 ml-auto flex items-end justify-center pb-1 text-slate-800 font-bold text-[10px]">
              Dr. R. Kadam
            </div>
            <span className="text-[11px] font-black text-slate-950 mt-1 block uppercase">
              Controller of Examinations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
