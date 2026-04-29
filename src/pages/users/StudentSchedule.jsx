import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import api from "../../api";

const StudentSchedule = () => {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get("attendance/schedules/");
        setScheduleItems(res.data || []);
      } catch (e) {
        console.error("schedule error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const groupedSchedule = {};
  daysOfWeek.forEach(day => { groupedSchedule[day] = []; });
  
  scheduleItems.forEach(item => {
    if (groupedSchedule[item.day]) {
      groupedSchedule[item.day].push(item);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" /> My Schedule
            </h1>
            <p className="text-gray-600">Your weekly class schedule</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {daysOfWeek.map(day => (
              groupedSchedule[day].length > 0 && (
                <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">{day}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {groupedSchedule[day].sort((a, b) => {
                      return (a.lesson_time_order || 0) - (b.lesson_time_order || 0);
                    }).map((s) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {s.course_title || s.course_name || `Course #${s.course}`}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Group: {s.group_name || s.group}</span>
                            <span className="text-gray-500">• {s.lesson_time_str || s.start_time || "—"}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            {scheduleItems.length === 0 && (
              <div className="lg:col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <p className="text-gray-500">No schedule items found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
