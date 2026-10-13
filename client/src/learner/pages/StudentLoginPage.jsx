import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PortalSwitcher from '../../components/PortalSwitcher';

export default function StudentLoginPage() {
  const { studentLogin } = useAuth();
  const navigate = useNavigate();
  const [prn, setPrn] = useState('121B1G148');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await studentLogin(prn, password);
      navigate('/learner/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid PRN number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <PortalSwitcher />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Student / Learner Portal</h1>
            <p className="text-xs text-slate-400">Pimpri Chinchwad College of Engineering & Autonomous Institute</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Permanent Registration Number (PRN) / Roll No
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  placeholder="e.g. 121B1G148"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Portal Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Student Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Click Demo Fill */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Demo Student Credentials:
              </span>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-300">
                <span>PRN: <strong>121B1G148</strong></span>
                <span>Pass: <strong>student123</strong></span>
              </div>
            </div>
          </form>

          <div className="text-center">
            <Link to="/staff/login" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Are you a faculty or staff member? Switch to Staff ERP &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
