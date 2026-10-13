import React from 'react';
import { Radio, Users, Eye, Sparkles, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import { useLiveSocket } from '../../context/WebSocketContext';

export default function LiveMonitorPage() {
  const { connected, liveMetrics } = useLiveSocket();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Live Student Marksheet & Portal Monitor</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of active learner sessions and students inspecting calculated autonomous marksheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="font-mono text-slate-600">{connected ? 'ENGINE ONLINE (WS: 5000)' : 'OFFLINE'}</span>
          </div>
          <a
            href="/learner/gradecard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <span>Open Student Site in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">Live Marksheet Viewers</p>
            <Eye className="w-5 h-5 text-emerald-200" />
          </div>
          <h2 className="text-3xl font-extrabold mt-2">{liveMetrics.marksheetViewersCount}</h2>
          <p className="text-[11px] text-emerald-100 mt-1">Learners actively viewing their Grade Card right now</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Online Student Sessions</p>
            <Users className="w-5 h-5 text-indigo-200" />
          </div>
          <h2 className="text-3xl font-extrabold mt-2">{liveMetrics.onlineStudentsCount}</h2>
          <p className="text-[11px] text-indigo-100 mt-1">Authenticated students browsing the portal</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Active WebSocket Tunnels</p>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold mt-2">{liveMetrics.totalConnections}</h2>
          <p className="text-[11px] text-slate-400 mt-1">Sub-second synchronization pipeline</p>
        </div>
      </div>

      {/* Active Marksheet Viewers Detailed Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Active Learners Inspecting Marksheets (Live Stream)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Updated continuously</span>
        </div>

        {liveMetrics.marksheetViewers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Waiting for Student Marksheet Viewers</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Open the Learner Portal in another browser window or tab and navigate to "My Grade Card" to see live student metadata appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">PRN Number</th>
                  <th className="py-3 px-4">Examination Inspected</th>
                  <th className="py-3 px-4">Connection Started</th>
                  <th className="py-3 px-4">Security Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveMetrics.marksheetViewers.map((viewer, index) => (
                  <tr key={index} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        VIEWING NOW
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{viewer.name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{viewer.prn}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{viewer.examTitle || 'Sem 6 Autonomous Exam'}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{new Date(viewer.connectedAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        JWT / Isolated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
