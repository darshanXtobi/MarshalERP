import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function AttendanceEntryPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [division, setDivision] = useState('A');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodNo, setPeriodNo] = useState(1);
  const [topic, setTopic] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({}); // studentId -> 'Present' | 'Absent'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/academics/courses?semester=6'),
          api.get('/students?semester=6&division=A')
        ]);
        setCourses(cRes.courses || []);
        if (cRes.courses?.length > 0) setSelectedCourse(cRes.courses[0].id);

        const studs = sRes.students || [];
        setStudents(studs);

        // Default all to Present
        const initialMap = {};
        studs.forEach(s => { initialMap[s.id] = 'Present'; });
        setAttendanceMap(initialMap);
      } catch (err) {
        setErrorMsg('Failed to load courses or student roster');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleToggle = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendanceMap(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setErrorMsg('Please select a course.');
      return;
    }
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const records = students.map(s => ({
      studentId: s.id,
      status: attendanceMap[s.id] || 'Present'
    }));

    try {
      const res = await api.post('/attendance/mark', {
        courseId: selectedCourse,
        semester: 6,
        division,
        sessionDate,
        periodNo: Number(periodNo),
        topicDelivered: topic || 'Regular Lecture',
        studentRecords: records
      });

      setSuccessMsg(`Attendance successfully recorded for ${records.length} students! Broadcast sent to Learner Portal.`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(v => v === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Lecture Attendance Roll Call
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mark daily attendance for enrolled division students. Changes sync live with student portals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
            Present: {presentCount}
          </div>
          <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold">
            Absent: {absentCount}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter / Session Configuration Card */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Division</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="A">Division A</option>
              <option value="B">Division B</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Period / Slot</label>
            <select
              value={periodNo}
              onChange={(e) => setPeriodNo(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              {[1, 2, 3, 4, 5, 6].map(p => (
                <option key={p} value={p}>Period {p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Topic Covered</label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Absent')}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200"
            >
              Mark All Absent
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit Lecture Attendance'}</span>
          </button>
        </div>
      </form>

      {/* Student Roll Call Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
          Student Attendance Grid ({students.length} Enrolled)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">PRN Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Toggle Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const isPresent = attendanceMap[student.id] === 'Present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{student.roll_no}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600">{student.prn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                          isPresent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPresent ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isPresent ? 'PRESENT' : 'ABSENT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(student.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isPresent
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        Set {isPresent ? 'Absent' : 'Present'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
