import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Phone, Mail, MapPin, X } from 'lucide-react';
import { api } from '../../services/api';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/students');
        setStudents(res.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openDossier = async (studentId) => {
    try {
      const res = await api.get(`/students/${studentId}`);
      setSelectedStudent(res.student);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Student Master Registry (360° Dossier)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete student lifecycle directory with Permanent Registration Numbers (PRN) and academic standing.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Name, Roll, or PRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">PRN</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Branch & Program</th>
                <th className="p-3 text-center">Division</th>
                <th className="p-3 text-center">Semester</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{student.roll_no}</td>
                  <td className="p-3 font-mono font-semibold text-indigo-600">{student.prn}</td>
                  <td className="p-3 font-bold text-slate-800">{student.name}</td>
                  <td className="p-3 text-slate-600">{student.program_name}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{student.division}</td>
                  <td className="p-3 text-center font-bold text-slate-700">Sem {student.current_sem}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDossier(student.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-700 font-semibold border border-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Dossier</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {selectedStudent.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-indigo-600 font-mono font-bold">
                  PRN: {selectedStudent.prn} | Seat No: {selectedStudent.seat_no}
                </p>
                <p className="text-xs text-slate-500">{selectedStudent.program_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Roll Number:</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedStudent.roll_no}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Division & Batch:</span>
                <p className="font-bold text-slate-800 mt-0.5">Div {selectedStudent.division} - {selectedStudent.batch}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Blood Group:</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedStudent.blood_group || 'O+'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Contact Phone:</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <span className="text-slate-500">Residential Address:</span>
              <p className="font-medium text-slate-800">{selectedStudent.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
