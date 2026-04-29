import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Users } from "lucide-react";
import api from "../../api";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const profileRes = await api.get("accounts/profile/");
        const groupId = profileRes.data?.student_data?.group?.id;
        
        if (groupId) {
          const r = await api.get(`api/course-allocations/group/${groupId}/`);
          setCourses(r.data || []);
        }
      } catch (e) {
        console.error("courses error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> My Courses
            </h1>
            <p className="text-gray-600">Courses you are currently enrolled in</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.flatMap((alloc) =>
              (alloc.courses_details || alloc.courses || []).map((c) => (
                <div
                  key={`${alloc.id}-${c.id || c.name}`}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {c.name || c.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Lecturer: {alloc.lecturer_name || alloc.lecturer || "—"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-100 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Group: {alloc.group_name || alloc.group}
                    </span>
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                      Semester: {alloc.semester_name || alloc.semester}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
