import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PortalSwitcher from '../../components/PortalSwitcher';

export default function StaffLoginPage() {
  const { staffLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await staffLogin(username, password);
      navigate('/staff/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or credentials');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <PortalSwitcher />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Staff & Faculty Portal</h1>
            <p className="text-xs text-slate-400">Pimpri Chinchwad College of Engineering & Autonomous Institute</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Username / Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="e.g. admin or faculty1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Staff ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Switcher Buttons */}
            <div className="pt-4 border-t border-slate-700/60 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Quick 1-Click Role Fill:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDemoRole('admin', 'admin123')}
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 text-left font-medium"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRole('examcontroller', 'exam123')}
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 text-left font-medium"
                >
                  📜 Exam Controller
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRole('faculty1', 'faculty123')}
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 text-left font-medium"
                >
                  👨‍🏫 Faculty Member
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRole('accounts', 'accounts123')}
                  className="p-1.5 bg-slate-900/80 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 text-left font-medium"
                >
                  💳 Accounts Officer
                </button>
              </div>
            </div>
          </form>

          <div className="text-center">
            <Link to="/learner/login" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Are you a student? Switch to Learner Portal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
