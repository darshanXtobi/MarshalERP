import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Radio, ArrowLeftRight } from 'lucide-react';
import { useLiveSocket } from '../context/WebSocketContext';

export default function PortalSwitcher() {
  const location = useLocation();
  const { liveMetrics } = useLiveSocket();
  const isStaff = location.pathname.startsWith('/staff');
  const isLearner = location.pathname.startsWith('/learner');

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between border-b border-slate-800 noprint">
      <div className="flex items-center space-x-3">
        <span className="font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          MARSHAL ERP
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300">Unified College Management & Learner Platform</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Active Marksheet Status Pill */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono">
            Live Viewers: <strong className="text-emerald-400">{liveMetrics.marksheetViewersCount}</strong>
          </span>
        </div>

        {/* Portal Switcher Buttons */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          <Link
            to="/staff/dashboard"
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              isStaff ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff ERP
          </Link>
          <Link
            to="/learner/dashboard"
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              isLearner ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Learner Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
