import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle, Clock, Plus } from 'lucide-react';
import { api } from '../../services/api';

export default function MyGrievancesPage() {
  const [grievances, setGrievances] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Academic');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/academics/grievances');
      setGrievances(res.grievances || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/academics/grievances', {
        subject,
        category,
        description
      });
      setSuccessMsg(`Grievance ticket created: ${res.ticketNo}. Under departmental review.`);
      setSubject('');
      setDescription('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Student Helpdesk & Grievance Redressal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit academic, examination, or administrative inquiries directly to departmental authorities.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Submit Ticket Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">File a New Inquiry / Grievance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Academic">Academic / Syllabus</option>
              <option value="Examination">Examination / Marksheet</option>
              <option value="Fees">Fee Accounts & Concession</option>
              <option value="Transport">Transport & Bus Pass</option>
              <option value="General">General Campus Inquiry</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Brief summary of inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description & Details</label>
          <textarea
            rows="3"
            placeholder="Provide complete context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            required
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Register Ticket'}</span>
          </button>
        </div>
      </form>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
          My Grievance Ticket History
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {grievances.map(ticket => (
            <div key={ticket.id} className="p-4 space-y-2 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {ticket.ticket_no}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{ticket.category}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ticket.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm">{ticket.subject}</h4>
              <p className="text-slate-600 text-xs">{ticket.description}</p>

              {ticket.resolution && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block text-[10px] text-emerald-700 uppercase">Official Resolution:</span>
                  <p>{ticket.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
