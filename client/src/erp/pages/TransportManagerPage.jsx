import React, { useState, useEffect } from 'react';
import { Bus, MapPin, User, Phone, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { api } from '../../services/api';

export default function TransportManagerPage() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [tRes, sRes] = await Promise.all([
          api.get('/transport/routes'),
          api.get('/students')
        ]);
        setRoutes(tRes.routes || []);
        setStops(tRes.stops || []);
        setStudents(sRes.students || []);
        if (tRes.routes?.length > 0) setSelectedRoute(tRes.routes[0].id);
        if (sRes.students?.length > 0) setSelectedStudent(sRes.students[0].id);
      } catch (err) {
        setErrorMsg('Failed to load transport data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoute) return;
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/transport/assign', {
        studentId: selectedStudent,
        routeId: selectedRoute,
        stopId: selectedStop || null
      });
      setSuccessMsg(`Bus pass generated: ${res.busPassNo}. Student transport enrolled!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-indigo-600" />
            Transport Routes & Digital Bus Pass Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional transit routes, vehicle rosters, bus stops, and student transit allocations.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map(route => (
          <div key={route.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase">
                  Vehicle: {route.vehicle_no}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{route.route_name}</h3>
              </div>
              <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                ₹ {route.annual_fee?.toLocaleString()} / yr
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Driver: <strong>{route.driver_name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: <strong className="font-mono">{route.driver_phone}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign Transport Form */}
      <form onSubmit={handleAssign} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Assign Student to Transport Route</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.prn}) - Div {s.division}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Route</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.route_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pick-up Stop</label>
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="">Default Route Terminal</option>
              {stops.map(st => (
                <option key={st.id} value={st.id}>{st.stop_name} ({st.pickup_time})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{submitting ? 'Allocating...' : 'Assign Route & Issue Pass'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
