import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  Award,
  CreditCard,
  Radio,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { useLiveSocket } from '../../context/WebSocketContext';

export default function ErpDashboard() {
  const { liveMetrics } = useLiveSocket();
  const [stats, setStats] = useState({
    totalStudents: 5,
    attendanceToday: '88.5%',
    examsPublished: 1,
    feeCollections: '₹ 4,35,000'
  });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studRes, noticeRes] = await Promise.all([
          api.get('/students'),
          api.get('/academics/notices')
        ]);
        setStats(prev => ({
          ...prev,
          totalStudents: studRes.total || 5
        }));
        setNotices(noticeRes.notices || []);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Autonomous Examination & Academic Session 2025-2026</span>
          </div>
          <h1 className="text-2xl font-bold">College ERP Administration Center</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Real-time management for academic records, lecture roll calls, evaluation, official SGPA/CGPA result publishing, and student portal synchronization.
          </p>
        </div>

        {/* Live Status Widget in Banner */}
        <div className="mt-4 pt-4 border-t border-indigo-700/50 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-700/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 font-semibold">{liveMetrics.marksheetViewersCount} Student(s)</span>
            <span className="text-slate-300">viewing live marksheets right now</span>
          </div>
          <Link
            to="/staff/live-monitor"
            className="text-indigo-300 hover:text-white flex items-center gap-1 font-semibold underline underline-offset-2"
          >
            Open Live Monitor Room <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Enrolled Students</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Active Batch 2022-26</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Average Attendance</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.attendanceToday}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Above mandatory 75%</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Published Results</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Sem 6 Regular</h3>
            <span className="text-[11px] text-indigo-600 font-medium">Live on Learner Site</span>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Confirmed Collections</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.feeCollections}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Reconciled with bank</span>
          </div>
          <div className="w-11 h-11 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Monitor Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Marksheet Viewers Live Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h2 className="font-bold text-slate-800 text-sm">Real-Time Student Marksheet Activity Monitor</h2>
            </div>
            <Link
              to="/staff/live-monitor"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Full Screen Monitor &rarr;
            </Link>
          </div>

          {liveMetrics.marksheetViewersCount === 0 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300">
              <Radio className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No students currently inspecting marksheets</p>
              <p className="text-xs text-slate-500 mt-1">
                When a student opens their Grade Card on the Learner Portal, their live session, PRN, and examined semester will appear here instantly.
              </p>
              <div className="mt-4">
                <Link
                  to="/learner/gradecard"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Simulate Student Opening Marksheet &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      {liveMetrics.marksheetViewersCount} Active Learner(s) Inspecting Live Marksheet
                    </h4>
                    <p className="text-[11px] text-emerald-700">Authoritative calculation engine syncing in real time via WebSocket</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {liveMetrics.marksheetViewers.map((viewer, i) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {viewer.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{viewer.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">PRN: {viewer.prn || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full">
                        LIVE: {viewer.examTitle || 'Semester Examination'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Online via Learner Portal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Operations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h2 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Administrative Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/staff/attendance"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs font-semibold text-slate-700 group"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                <span>Mark Lecture Attendance</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </Link>

            <Link
              to="/staff/marks-entry"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs font-semibold text-slate-700 group"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Enter Assessment Marks</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
            </Link>

            <Link
              to="/staff/results-publish"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs font-semibold text-slate-700 group"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Calculate & Publish Results</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
            </Link>

            <Link
              to="/staff/fees"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs font-semibold text-slate-700 group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>Record Fee Payment</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
