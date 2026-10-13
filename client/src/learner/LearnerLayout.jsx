import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  FileText,
  CreditCard,
  Bus,
  Calendar,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Radio,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveSocket } from '../context/WebSocketContext';
import PortalSwitcher from '../components/PortalSwitcher';

export default function LearnerLayout() {
  const { user, logout } = useAuth();
  const { lastNotification } = useLiveSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Student Dashboard', path: '/learner/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/learner/attendance', icon: ClipboardCheck },
    { name: 'My Grade Card (Live Marksheet)', path: '/learner/gradecard', icon: Award, highlight: true },
    { name: 'Exam Hall Ticket', path: '/learner/hall-ticket', icon: FileText },
    { name: 'Fee Dues & Receipts', path: '/learner/fees', icon: CreditCard },
    { name: 'Transport & Bus Pass', path: '/learner/transport', icon: Bus },
    { name: 'Class Timetable', path: '/learner/timetable', icon: Calendar },
    { name: 'Campus Notices', path: '/learner/notices', icon: Bell },
    { name: 'Grievance / Helpdesk', path: '/learner/grievance', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/learner/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <PortalSwitcher />

      {/* Real-time broadcast alert toast */}
      {lastNotification && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md noprint">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 animate-ping" />
            <span><strong>{lastNotification.title}</strong>: {lastNotification.message}</span>
          </div>
          <span className="text-[10px] text-emerald-200 font-mono">{lastNotification.timestamp}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (EduPlusCampus Style) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'
          } border-r border-slate-800 noprint`}
        >
          {/* Student Profile Snapshot in Sidebar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Learner Portal
              </span>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div className="truncate">
                <h2 className="font-bold text-xs text-white truncate">{user?.name || 'Darshan Dalvi'}</h2>
                <p className="text-[10px] text-emerald-400 font-mono font-semibold">PRN: {user?.prn || '121B1G148'}</p>
                <p className="text-[10px] text-slate-400">Roll: {user?.rollNo || 'CS-401'} | Div {user?.division || 'A'}</p>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white font-bold shadow-md'
                      : item.highlight
                      ? 'text-emerald-300 hover:bg-slate-800 hover:text-white bg-emerald-950/30 border border-emerald-800/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !active && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header & Breadcrumbs */}
          <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs noprint">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-slate-800">
                  Pimpri Chinchwad College of Engineering & Autonomous Institute
                </h1>
                <div className="flex items-center text-[11px] text-slate-500 space-x-1.5 mt-0.5">
                  <span>Home</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-700 font-semibold uppercase">
                    {location.pathname.replace('/learner/', '').replace('-', ' ') || 'Dashboard'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-800">{user?.name || 'Darshan Dalvi'}</span>
                <span className="block text-[10px] text-slate-500 font-mono">B.Tech Computer Engg (Sem 6)</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-300">
                {user?.name?.charAt(0) || 'D'}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
