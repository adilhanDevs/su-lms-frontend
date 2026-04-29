import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, Award, Calendar } from "lucide-react";
import api from "../../../api";

const TeacherCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await api.get(`api/course-allocations/${id}/`);
        setAllocation(res.data);
      } catch (e) {
        console.error("error fetching course allocation detail", e);
        // If not admin, they might not have access to retrieve this specific allocation directly if the view limits to IsAdminUser for retrieve.
        // Let's fallback to list and find it
        try {
          const listRes = await api.get("api/teacher-allocations/");
          const found = listRes.data.find(a => a.id.toString() === id);
          if (found) {
            setAllocation(found);
          } else {
            console.error("Course allocation not found in teacher allocations");
          }
        } catch (listErr) {
          console.error("Fallback failed", listErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-gray-600 mb-6">The requested course details could not be found or you do not have permission.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
          Go Back
        </button>
      </div>
    );
  }

  const courseName = allocation.courses_details?.[0]?.name || allocation.courses?.[0]?.name || "Unknown Course";
  const courseDesc = allocation.courses_details?.[0]?.description || "No description provided.";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Details</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-700 px-8 py-10 text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{courseName}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                Group: {allocation.group_name || allocation.group}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                Semester: {allocation.semester_name || allocation.semester}
              </span>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {courseDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to={`/teacher/grades/${allocation.id}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Manage Grades</h3>
            <p className="text-sm text-gray-500 mt-1">Grade students for this course</p>
          </Link>
          
          <Link to={`/teacher/attendance/${allocation.id}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Take Attendance</h3>
            <p className="text-sm text-gray-500 mt-1">Mark presence for students</p>
          </Link>

          <Link to="/teacher/schedule" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">View Schedule</h3>
            <p className="text-sm text-gray-500 mt-1">Check lesson times for group</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
