import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit2,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  BarChart3,
  ExternalLink,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon
} from "lucide-react";

const UserDetail = ({ role }) => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/accounts/lecturers/${id}/`);
      console.log("Fetched teacher data:", response.data);
      setTeacher(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching teacher:", err);
      setError("Failed to load teacher information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case "M":
        return "Male";
      case "F":
        return "Female";
      default:
        return "Not specified";
    }
  };

  const getRoleText = () => {
    switch (role) {
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      case "parent":
        return "Parent";
      default:
        return "User";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">{error}</p>
            <button
              onClick={fetchTeacher}
              className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">User not found</p>
            <Link
              to={role === "teacher" ? "/admin/create-lecturers" : "/admin/create-students"}
              className="inline-block mt-4 px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "activity", label: "Activity", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to={role === "teacher" ? "/admin/create-lecturers" : "/admin/create-students"}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600">Detailed information about the {getRoleText().toLowerCase()}</p>
              </div>
            </div>
            <Link
              to={`/admin/${role}/${teacher.id}/edit`}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <User className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {teacher.lecturer?.first_name} {teacher.lecturer?.last_name}
                </h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>{getRoleText()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>ID: {teacher.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(teacher.lecturer?.date_joined)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MailIcon className="w-5 h-5 text-blue-600" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{teacher.lecturer?.email}</p>
                          </div>
                          {teacher.lecturer?.phone && (
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">{teacher.lecturer?.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-purple-600" />
                          Personal Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium text-gray-900">{getGenderText(teacher.lecturer?.gender)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Account Status</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {teacher.lecturer?.address && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5 text-green-600" />
                          Address
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{teacher.lecturer?.address}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "courses" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Information</h3>
                    <p className="text-gray-600">Course data will appear here when available</p>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Log</h3>
                    <p className="text-gray-600">User activity data will appear here when available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-semibold text-gray-900">{teacher.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Username</span>
                  <span className="font-semibold text-gray-900">{teacher.lecturer?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-semibold text-gray-900">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Created</span>
                  <span className="font-semibold text-gray-900">{formatDate(teacher.lecturer?.date_joined)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <span>Send Message</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <span>View Attendance</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <span>Reset Password</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;