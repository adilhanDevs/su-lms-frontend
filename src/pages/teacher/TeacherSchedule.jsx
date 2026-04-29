import React, { useEffect, useState } from "react";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Calendar, Clock } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TeacherSchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("attendance/schedules/");
        setItems(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = items.filter((i) => i.day === day);
    return acc;
  }, {});

  return (
    <PageShell title="My Schedule" subtitle="Classes assigned to you">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No schedule items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{day}</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {grouped[day].length}
                </span>
              </div>
              {grouped[day].length === 0 && (
                <p className="text-xs text-gray-400">No classes</p>
              )}
              <div className="space-y-2">
                {grouped[day].map((s) => (
                  <div key={s.id} className="bg-gray-50 rounded-xl p-3">
                    <p className="font-medium text-gray-900 text-sm">
                      {s.course_title || s.course_name || `Course #${s.course}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{s.lesson_time_str || s.start_time || "—"}</span>
                      <span>• Group {s.group_name || s.group}</span>
                    </div>
                    {s.date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
