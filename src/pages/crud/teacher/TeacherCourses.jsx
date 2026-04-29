import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Award, Users, FileText, Loader2, GraduationCap, ChevronRight, Calendar } from "lucide-react";
import api from "../../../api";

const TeacherCourses = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("api/teacher-allocations/")
      .then(res => setAllocations(res.data || []))
      .catch(e => console.error("allocations error", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Courses</h1>
              <p className="text-sm text-slate-500">All courses assigned to you this semester</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
            Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-500">No courses assigned yet.</p>
            <p className="text-sm text-slate-400 mt-1">Contact the administrator to get courses assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allocations.map((a) => {
              const courseName = a.courses_details?.[0]?.name || "Unnamed Course";
              const courseDesc = a.courses_details?.[0]?.description;
              const extraCount = (a.courses_details?.length || 1) - 1;

              return (
                <div key={a.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all flex flex-col overflow-hidden">
                  <div className="p-6 flex-1">
                    {/* Course Icon + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      {extraCount > 0 && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          +{extraCount} more
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">{courseName}</h3>
                    {courseDesc && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{courseDesc}</p>}

                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{a.group_name || `Group #${a.group}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{a.semester_name || `Semester #${a.semester}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <Link
                      to={`/teacher/grades/${a.id}`}
                      className="flex flex-col items-center gap-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-bold">Grades</span>
                    </Link>
                    <Link
                      to={`/teacher/attendance/${a.id}`}
                      className="flex flex-col items-center gap-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold">Attendance</span>
                    </Link>
                    <Link
                      to={`/teacher/course/${a.id}`}
                      className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-bold">Details</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourses;
