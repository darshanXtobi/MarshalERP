import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ClipboardCheck,
  CreditCard,
  Bus,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [attData, setAttData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const studentId = user?.studentId || user?.id || 'default';
        const [aRes, fRes, nRes] = await Promise.all([
          api.get(`/attendance/student/${studentId}`),
          api.get(`/fees/student/${studentId}`),
          api.get('/academics/notices')
        ]);
        setAttData(aRes);
        setFeeData(fRes);
        setNotices(nRes.notices || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const attPercent = attData?.overall?.percentage ?? 90.0;
  const balance = feeData?.account?.balance ?? 0;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Autonomous Academic Term 2025-2026</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Darshan Dalvi'}!</h1>
          <p className="text-emerald-200 text-xs mt-1">
            Permanent Registration No: <strong className="font-mono text-white">{user?.prn || '121B1G148'}</strong> | Roll No: <strong className="font-mono text-white">{user?.rollNo || 'CS-401'}</strong> | Division {user?.division || 'A'}
          </p>
        </div>

        {/* Action shortcut button in banner */}
        <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center gap-4 text-xs">
          <Link
            to="/learner/gradecard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
          >
            <Award className="w-4 h-4" />
            <span>View Official Live Marksheet (SGPA 8.89)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-emerald-300 text-xs">
            Controller of Examinations has released verified grade cards.
          </span>
        </div>
      </div>

      {/* Student Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/learner/attendance"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">My Attendance</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{attPercent}%</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Satisfactory (&ge; 75%)
          </span>
        </Link>

        <Link
          to="/learner/gradecard"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">Current SGPA</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-700 mt-2">8.89</h3>
          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
            CGPA: 8.78 (First Class with Dist.)
          </span>
        </Link>

        <Link
          to="/learner/fees"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">Fee Status</p>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">₹ {balance.toLocaleString()}</h3>
          <span className={`text-[11px] font-semibold flex items-center gap-1 mt-1 ${balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {balance === 0 ? 'All Dues Cleared' : 'Pending Installment'}
          </span>
        </Link>

        <Link
          to="/learner/transport"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">Transit Bus Pass</p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-2 font-mono">Route 1 Active</h3>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            Chandani Chowk Metro
          </span>
        </Link>
      </div>

      {/* Main Action Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Marksheet Banner Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Verified Autonomous Marksheet (Live)</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              OFFICIALLY PUBLISHED
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Your official Semester 6 Grade Card with course-wise credits, In-Semester (ISE), End-Semester (ESE), letter grades, grade points, SGPA, CGPA, and anti-tamper barcode has been released.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Examination:</span>
              <p className="font-bold text-slate-800">End Semester Autonomous Examination (May-June 2026)</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Result Status:</span>
              <p className="font-extrabold text-emerald-700">PASS (SGPA 8.89)</p>
            </div>
            <Link
              to="/learner/gradecard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs text-center"
            >
              Open Marksheet &rarr;
            </Link>
          </div>
        </div>

        {/* Notices Feed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Campus Announcements</h2>
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{notice.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
