import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Phone, User, ShieldCheck, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function MyTransportPage() {
  const { user } = useAuth();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransport() {
      try {
        const studentId = user?.studentId || user?.id || 'default';
        const res = await api.get(`/transport/student/${studentId}`);
        setTransport(res.transport);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTransport();
  }, [user]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-amber-600" />
            Digital Transport Pass & Route Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative bus pass allocation and transit schedule for campus commute.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold noprint"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>

      {transport ? (
        /* Digital Bus Pass Card */
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border-2 border-amber-400">
          <div className="flex items-start justify-between border-b border-amber-400/40 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
                PCCOE AUTONOMOUS TRANSIT PASS
              </span>
              <h2 className="text-lg font-black mt-0.5">{transport.student_name}</h2>
              <p className="text-xs text-amber-200 font-mono font-bold">
                PRN: {transport.prn} | Div: {transport.division}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-200 block uppercase">Bus Pass Number</span>
              <span className="font-mono text-sm font-black bg-black/40 px-3 py-1 rounded-lg border border-amber-400/50 block mt-1">
                {transport.bus_pass_no}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6 text-xs">
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-amber-200 uppercase font-semibold">Allocated Transit Route</span>
              <p className="font-bold text-white text-sm">{transport.route_name}</p>
              <p className="text-[11px] font-mono text-amber-300">Vehicle No: {transport.vehicle_no}</p>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-amber-200 uppercase font-semibold">Designated Pick-Up Point</span>
              <p className="font-bold text-white text-sm">{transport.stop_name || 'Chandani Chowk'}</p>
              <p className="text-[11px] font-mono text-amber-300">Timing: {transport.pickup_time || '07:35 AM'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-amber-400/30 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-amber-200">Transit In-Charge / Driver</span>
              <p className="font-bold">{transport.driver_name} ({transport.driver_phone})</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase">
              STATUS: {transport.status}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          <Bus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-800">No Transport Enrolled</h3>
          <p className="text-xs text-slate-500 mt-1">
            You are currently not enrolled in college transport services. Visit the Transport Office to apply.
          </p>
        </div>
      )}
    </div>
  );
}
