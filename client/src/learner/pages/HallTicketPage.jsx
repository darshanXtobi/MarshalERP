import React, { useState, useEffect } from 'react';
import { FileText, Printer, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function HallTicketPage() {
  const { user } = useAuth();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHallTicket() {
      try {
        const studentId = user?.studentId || user?.id || 'default';
        const res = await api.get(`/exams/hall-ticket/${studentId}/default`);
        setTicketData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHallTicket();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const student = ticketData?.student || user;
  const schedule = ticketData?.schedule || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between noprint">
        <div>
          <h2 className="font-bold text-sm text-slate-900">Examination Admit Card / Hall Ticket</h2>
          <p className="text-xs text-slate-500">Official autonomous entry pass for end-semester theory and practical examinations.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
        >
          <Printer className="w-4 h-4" />
          <span>Print Admit Card</span>
        </button>
      </div>

      {/* Printable Hall Ticket Document */}
      <div className="bg-white p-8 md:p-10 rounded-2xl border-2 border-slate-800 shadow-lg text-slate-900 print:border-none print:shadow-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <h1 className="text-xl font-black uppercase text-slate-950">
            PIMPRI CHINCHWAD COLLEGE OF ENGINEERING & AUTONOMOUS INSTITUTE
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
            OFFICE OF THE CONTROLLER OF EXAMINATIONS
          </p>
          <div className="inline-block px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest mt-1">
            EXAMINATION ADMIT CARD / HALL TICKET - MAY/JUNE 2026
          </div>
        </div>

        {/* Candidate Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 border border-slate-300 rounded-lg bg-slate-50 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase">Candidate Name</span>
            <p className="font-extrabold text-slate-950 mt-0.5">{student?.name || 'Darshan Dalvi'}</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase">PRN Number</span>
            <p className="font-mono font-bold text-indigo-700 mt-0.5">{student?.prn || '121B1G148'}</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase">Exam Seat Number</span>
            <p className="font-mono font-extrabold text-slate-950 mt-0.5">{student?.seat_no || 'T190058201'}</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase">Branch / Semester</span>
            <p className="font-bold text-slate-900 mt-0.5">Computer Engg (Sem 6 - Div A)</p>
          </div>
        </div>

        {/* Timetable Schedule Grid */}
        <div className="my-6 border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-r border-slate-300">Date & Slot</th>
                <th className="p-2.5 border-r border-slate-300">Course Code</th>
                <th className="p-2.5 border-r border-slate-300">Course Name</th>
                <th className="p-2.5 border-r border-slate-300">Component</th>
                <th className="p-2.5 border-r border-slate-300">Examination Centre</th>
                <th className="p-2.5 text-center">Invigilator Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schedule.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-mono font-semibold border-r border-slate-200">{item.date} ({item.time})</td>
                  <td className="p-2.5 font-mono font-bold border-r border-slate-200 text-indigo-700">{item.courseCode}</td>
                  <td className="p-2.5 font-medium border-r border-slate-200">{item.courseName}</td>
                  <td className="p-2.5 border-r border-slate-200 font-bold">{item.component}</td>
                  <td className="p-2.5 border-r border-slate-200 text-slate-600">{item.centre}</td>
                  <td className="p-2.5 text-center text-slate-300 font-serif italic">[ Sign ]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Barcode & Signature */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 flex items-end justify-between text-xs">
          <div>
            <div className="font-mono text-xs font-bold tracking-widest text-slate-900 bg-slate-100 p-2 rounded border border-slate-300">
              *{student?.prn || '121B1G148'}-HALLTICKET-SEM6*
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Barcoded Digital Verification</span>
          </div>

          <div className="text-right">
            <div className="w-36 h-8 border-b-2 border-slate-900 ml-auto pb-1 text-slate-800 font-bold text-[10px]">
              Dr. R. Kadam
            </div>
            <span className="text-[11px] font-bold text-slate-950 uppercase block mt-1">
              Controller of Examinations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
