import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowLeft, Search, Filter, User } from "lucide-react";
import api from "../../../api";

const MethodologistSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeacher, setFilterTeacher] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/attendance/schedules/");
      setSchedules(res.data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((s) =>
    (s.lecturer_name || "").toLowerCase().includes(filterTeacher.toLowerCase()) ||
    (s.course_title || "").toLowerCase().includes(filterTeacher.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs/Back */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" /> All Teacher Schedules
            </h1>
            <p className="text-slate-500 mt-1">Global view of all educational activities</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher or course..."
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full md:w-64 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">
                            {s.lecturer_name || `Teacher #${s.lecturer}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 text-sm">
                        {s.course_title || s.course_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                          {s.group_name || s.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {s.day}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-500 text-sm gap-2 font-medium">
                          <Filter className="w-3.5 h-3.5" />
                          {s.lesson_time_str || s.start_time}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSchedules.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No schedules found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodologistSchedules;
