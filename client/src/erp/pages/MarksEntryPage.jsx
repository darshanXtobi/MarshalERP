import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Award,
  Save,
  CheckCircle,
  AlertCircle,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export default function MarksEntryPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [compDetails, setCompDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksState, setMarksState] = useState({}); // student_id -> { marks_obtained, is_absent }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load examinations
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.get('/exams');
        setExams(res.exams || []);
        if (res.exams?.length > 0) {
          setSelectedExam(res.exams[0].id);
        }
      } catch (err) {
        setErrorMsg('Failed to load examinations');
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  // 2. Load components for exam
  useEffect(() => {
    if (!selectedExam) return;
    async function loadComps() {
      try {
        const res = await api.get(`/exams/${selectedExam}/components`);
        setComponents(res.components || []);
        if (res.components?.length > 0) {
          setSelectedComp(res.components[0].id);
        }
      } catch (err) {
        setErrorMsg('Failed to load assessment components');
      }
    }
    loadComps();
  }, [selectedExam]);

  // 3. Load students and marks for selected component
  useEffect(() => {
    if (!selectedExam || !selectedComp) return;
    async function loadGrid() {
      setLoading(true);
      try {
        const res = await api.get(`/exams/${selectedExam}/components/${selectedComp}/marks`);
        setCompDetails(res.component);
        setStudents(res.students || []);

        const initialMarks = {};
        (res.students || []).forEach(s => {
          initialMarks[s.student_id] = {
            marks_obtained: s.marks_obtained !== null ? s.marks_obtained : '',
            is_absent: Boolean(s.is_absent)
          };
        });
        setMarksState(initialMarks);
      } catch (err) {
        setErrorMsg('Failed to load marks entry grid');
      } finally {
        setLoading(false);
      }
    }
    loadGrid();
  }, [selectedExam, selectedComp]);

  const handleMarkChange = (studentId, value) => {
    const max = compDetails?.max_marks || 100;
    const num = Number(value);
    if (value !== '' && (num < 0 || num > max)) {
      setErrorMsg(`Marks cannot exceed maximum permitted marks of ${max}`);
      return;
    }
    setErrorMsg('');
    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: value
      }
    }));
  };

  const handleAbsentToggle = (studentId) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        is_absent: !prev[studentId]?.is_absent,
        marks_obtained: !prev[studentId]?.is_absent ? 0 : prev[studentId]?.marks_obtained
      }
    }));
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const marksList = students.map(s => ({
      student_id: s.student_id,
      marks_obtained: marksState[s.student_id]?.is_absent ? 0 : Number(marksState[s.student_id]?.marks_obtained || 0),
      is_absent: marksState[s.student_id]?.is_absent ? 1 : 0
    }));

    try {
      await api.post('/exams/marks', {
        componentId: selectedComp,
        marksList
      });
      setSuccessMsg(`Marks successfully saved for ${marksList.length} students in ${compDetails?.component_name} (${compDetails?.course_name})`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-600" />
            Faculty Assessment & Marks Entry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tabular mark entry for internal (ISE), external (ESE), and practical evaluations.
          </p>
        </div>

        {compDetails && (
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-semibold">
              Max Marks: {compDetails.max_marks}
            </div>
            <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold">
              Passing: {compDetails.passing_marks}
            </div>
          </div>
        )}
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

      {/* Selectors */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Examination Session</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.title} ({ex.academic_year})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Course & Assessment Component</label>
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
          >
            {components.map(cp => (
              <option key={cp.id} value={cp.id}>
                {cp.course_code} - {cp.course_name} ({cp.component_name} - Max: {cp.max_marks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <form onSubmit={handleSaveMarks} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Student Marks Entry Table - {compDetails?.course_name} ({compDetails?.component_name})
          </span>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Marks'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">PRN Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Marks Obtained (Max: {compDetails?.max_marks || 100})</th>
                <th className="py-3 px-4 text-center">Absent Flag</th>
                <th className="py-3 px-4 text-center">Passing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const current = marksState[student.student_id] || {};
                const marksVal = current.marks_obtained;
                const isAbsent = Boolean(current.is_absent);
                const isPassed = !isAbsent && Number(marksVal) >= (compDetails?.passing_marks || 0);

                return (
                  <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{student.roll_no}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600">{student.prn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={compDetails?.max_marks || 100}
                        step="1"
                        disabled={isAbsent}
                        value={marksVal}
                        onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                        placeholder="0"
                        className={`w-24 text-center p-2 rounded-lg border font-mono text-xs font-bold ${
                          isAbsent
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAbsent}
                          onChange={() => handleAbsentToggle(student.student_id)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span className="text-[11px] font-semibold text-slate-600">Mark Absent</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isAbsent
                            ? 'bg-slate-100 text-slate-600'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isAbsent ? 'ABSENT' : isPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
