import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Award, BookOpen, Users, FileText } from "lucide-react";

export default function TeacherCourses() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("api/teacher-allocations/");
        setAllocations(r.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell title="My Courses" subtitle="Course allocations assigned to you">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : allocations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No courses assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allocations.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {a.courses_details?.[0]?.name || a.courses?.[0]?.name || "Course"}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Group: {a.group_name || a.group}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Semester: {a.semester_name || a.semester}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to={`/teacher/grades/${a.id}`}
                  className="flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                >
                  <Award className="w-3 h-3" /> Grades
                </Link>
                <Link
                  to={`/teacher/attendance/${a.id}`}
                  className="flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"
                >
                  <Users className="w-3 h-3" /> Attendance
                </Link>
                <Link
                  to={`/teacher/course/${a.id}`}
                  className="flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                >
                  <FileText className="w-3 h-3" /> Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
