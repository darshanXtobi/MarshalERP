import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Radio, ArrowRight, Award, ClipboardCheck, CreditCard, Bus, Sparkles } from 'lucide-react';
import { useLiveSocket } from '../context/WebSocketContext';
import PortalSwitcher from '../components/PortalSwitcher';

export default function PortalLanding() {
  const { liveMetrics } = useLiveSocket();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      <PortalSwitcher />

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col justify-center space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Unified College Management & Real-Time Marksheet Sync</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Integrated College ERP & Connected Learner Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            One authoritative backend engine connecting faculty, administrators, accounts, and students with real-time marksheet calculations, lecture attendance roll calls, and live viewer monitoring.
          </p>

          {/* Live Viewer Radar Pill */}
          <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">Live Marksheet Viewers Currently Active:</span>
            <strong className="text-emerald-400 font-mono text-sm">{liveMetrics.marksheetViewersCount} Students</strong>
          </div>
        </div>

        {/* The Two Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Site 1: Staff ERP Portal */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/80 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl flex flex-col justify-between hover:border-indigo-500/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  SITE 1 • ADMINISTRATIVE & FACULTY
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Staff College ERP</h2>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Empowers Super Admins, Principals, Examination Controllers, HODs, and Faculty to manage academic courses, lecture roll calls, marks entry, official SGPA/CGPA result calculation, and fees.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                  <span>Lecture Attendance Roll Call & Shortage Audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Assessment Marks Entry & Calculation Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Live Learner Marksheet Activity Monitor</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <Link
                to="/staff/dashboard"
                className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Launch Staff ERP Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Site 2: Learner Student Portal */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/80 rounded-3xl p-8 border border-emerald-500/30 shadow-2xl flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  SITE 2 • STUDENT / LEARNER
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Learner Student Portal</h2>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Preserving and enhancing your original student portal with live grade cards, SGPA/CGPA evaluation, printable hall tickets, subject-wise attendance tracking, fee receipts, and digital bus passes.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Official Live Marksheet with Barcode & SGPA 8.89</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  <span>Subject Attendance & Conducted Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Fee Dues & Downloadable 3-Copy Receipts</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <Link
                to="/learner/dashboard"
                className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
              >
                <span>Launch Learner Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
