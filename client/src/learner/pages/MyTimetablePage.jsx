import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { api } from '../../services/api';

export default function MyTimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTT() {
      try {
        const res = await api.get('/academics/timetable?semester=6&division=A');
        setTimetable(res.timetable || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTT();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Class Lecture Timetable (Division A - Sem 6)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly academic schedule, allocated lecture halls, and faculty instructors.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {days.map(day => {
          const daySlots = timetable.filter(t => t.day_of_week === day);
          return (
            <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>{day}</span>
                <span className="text-[11px] text-slate-300 font-mono">{daySlots.length} Slots</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-2">
                {daySlots.map(slot => (
                  <div key={slot.id} className="p-3 space-y-1.5 hover:bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-600">
                      <Clock className="w-3 h-3" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800">{slot.course_code}: {slot.course_name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{slot.faculty_name}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                      Room: {slot.room_no}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
