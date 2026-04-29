import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowLeft, TrendingUp, Search, User, Award, CheckCircle } from "lucide-react";
import api from "../../../api";

const MethodologistPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      // Fetching grades from across the system
      const res = await api.get("/result/api/grade-semesters/");
      setPerformanceData(res.data || []);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = performanceData.filter(d => 
    d.student_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.course_title?.toLowerCase().includes(search.toLowerCase()) ||
    d.group_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getGradeBadgeColor = (grade) => {
    if (["A+", "A", "A-"].includes(grade)) return "bg-emerald-100 text-emerald-800";
    if (["B+", "B", "B-"].includes(grade)) return "bg-blue-100 text-blue-800";
    if (["C+", "C", "C-"].includes(grade)) return "bg-yellow-100 text-yellow-800";
    if (["D", "F"].includes(grade)) return "bg-red-100 text-red-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-600" /> Academic Performance
            </h1>
            <p className="text-slate-500 mt-1">Cross-institutional grades and attendance monitoring</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by student, group or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full md:w-80 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Final Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <User className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">
                            {d.student_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm font-medium">
                        {d.course_title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 text-sm">
                          {d.group_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm font-bold text-slate-700">{d.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{d.activities} pts</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold ${getGradeBadgeColor(d.grade)} shadow-sm`}>
                          {d.grade || "—"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No performance records found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodologistPerformance;
