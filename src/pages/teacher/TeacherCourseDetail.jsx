import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Award, Users, BookOpen, Calendar } from "lucide-react";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const [allocation, setAllocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`api/course-allocations/${id}/`);
        setAllocation(r.data);
        if (r.data?.group) {
          try {
            const sr = await api.get(`accounts/students/by-group/${r.data.group}/`);
            setStudents(sr.data || []);
          } catch {
            /* ignore */
          }
        }
        try {
          const allSched = await api.get("attendance/schedules/");
          const filtered = (allSched.data || []).filter(
            (s) => String(s.group) === String(r.data?.group)
          );
          setSchedule(filtered);
        } catch {
          /* ignore */
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <PageShell
      title="Course Detail"
      subtitle={allocation?.courses_details?.[0]?.name || "Course allocation"}
      backTo="/teacher/courses"
    >
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : !allocation ? (
        <p className="text-gray-500">Allocation not found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Courses</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(allocation.courses_details || allocation.courses || []).map((c, i) => (
                  <div key={c.id || i} className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900">{c.name || c.title}</p>
                    {c.description && (
                      <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Students ({students.length})
                </h3>
              </div>
              {students.length === 0 ? (
                <p className="text-sm text-gray-500">No students in this group yet.</p>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <p className="font-medium text-gray-900 text-sm">
                        {s.student?.first_name} {s.student?.last_name}
                      </p>
                      <span className="text-xs text-gray-500">{s.student?.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Schedule ({schedule.length})
                </h3>
              </div>
              {schedule.length === 0 ? (
                <p className="text-sm text-gray-500">No scheduled lessons.</p>
              ) : (
                <div className="space-y-2">
                  {schedule.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {s.course_title || s.course_name || `Course #${s.course}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {s.day} • {s.lesson_time_str || s.start_time || "—"}
                        </p>
                      </div>
                      {s.date && (
                        <span className="text-xs text-gray-500">
                          {new Date(s.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={`/teacher/grades/${id}`}
              className="block w-full p-4 bg-blue-600 text-white text-center rounded-xl hover:bg-blue-700 font-medium"
            >
              <Award className="w-4 h-4 inline mr-2" />
              Manage Grades
            </Link>
            <Link
              to={`/teacher/attendance/${id}`}
              className="block w-full p-4 bg-emerald-600 text-white text-center rounded-xl hover:bg-emerald-700 font-medium"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Mark Attendance
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
