import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  ClipboardCheck,
  BarChart3,
  Edit3,
  Award,
  CreditCard,
  Bus,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveSocket } from '../context/WebSocketContext';
import PortalSwitcher from '../components/PortalSwitcher';

export default function ErpLayout() {
  const { user, logout } = useAuth();
  const { liveMetrics } = useLiveSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    {
      name: 'Live Learner Monitor',
      path: '/staff/live-monitor',
      icon: Radio,
      badge: liveMetrics.marksheetViewersCount > 0 ? `${liveMetrics.marksheetViewersCount} Live` : null,
      badgeColor: 'bg-emerald-500'
    },
    { name: 'Attendance Roll Call', path: '/staff/attendance', icon: ClipboardCheck },
    { name: 'Attendance Reports', path: '/staff/attendance-reports', icon: BarChart3 },
    { name: 'Marks Entry', path: '/staff/marks-entry', icon: Edit3 },
    { name: 'Result & Marksheet Engine', path: '/staff/results-publish', icon: Award },
    { name: 'Fee Collections & Receipts', path: '/staff/fees', icon: CreditCard },
    { name: 'Transport & Bus Passes', path: '/staff/transport', icon: Bus },
    { name: 'Students Directory (360°)', path: '/staff/students', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <PortalSwitcher />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'
          } border-r border-slate-800`}
        >
          {/* Institution Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white">Marshal ERP</h1>
                <p className="text-[11px] text-slate-400">Staff & Faculty Portal</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
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
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor} animate-pulse`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold flex items-center justify-center text-xs border border-indigo-500/30">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div className="truncate text-xs">
                  <div className="font-semibold text-white truncate">{user?.displayName || user?.username || 'Staff User'}</div>
                  <div className="text-[10px] text-indigo-400 uppercase font-mono tracking-wider">{user?.role || 'Staff'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs noprint">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-slate-800">
                  Pimpri Chinchwad College of Engineering & Autonomous Institute
                </h2>
                <p className="text-[11px] text-slate-500">Autonomous Academic Administration System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Live Status indicator */}
              <Link
                to="/staff/live-monitor"
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>Live Viewers: <strong>{liveMetrics.marksheetViewersCount}</strong></span>
              </Link>
            </div>
          </header>

          {/* Page Outlet */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
