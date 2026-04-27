import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Clock,
  ChevronRight,
  Edit3,
  Eye,
  GraduationCap,
  Shield,
  Lock,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  CheckCircle,
  Star,
  RefreshCw,
  MessageSquare
} from "lucide-react";

const TeacherDashboard = () => {
  const [myAllocations, setMyAllocations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingGrades: 0,
    attendanceRate: 0
  });

  // Функция для получения профиля преподавателя
  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      console.log("Teacher profile loaded:", res.data);
      setProfile(res.data);
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    }
  };

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("api/teacher-allocations/");
      console.log("Teacher allocations loaded:", res.data);
      setMyAllocations(res.data);
      
      // Calculate stats
      let totalStudents = 0;
      let activeCourses = res.data.length || 0;
      
      res.data.forEach(allocation => {
        // Estimate students per group (example logic)
        totalStudents += 25; // Assuming 25 students per group
      });
      
      setStats({
        totalStudents,
        activeCourses,
        pendingGrades: 12, // Mock data
        attendanceRate: 94 // Mock data
      });
      
    } catch (e) {
      console.error("Ошибка загрузки распределений:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchProfile(), fetchAllocations()]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case "M": return "Male";
      case "F": return "Female";
      default: return "Not specified";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
    { id: "grades", label: "Grades", icon: <Award className="w-4 h-4" /> },
  ];

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, <span className="text-green-600">{profile?.first_name || "Teacher"}!</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <a
              href="/logout"
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center gap-2 font-medium shadow-lg shadow-red-500/25 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
                <p className="text-xs text-green-600 mt-1">+2 this semester</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-blue-600 mt-1">+5 this week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Pending Grades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
                <p className="text-xs text-yellow-600 mt-1">Due tomorrow</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                <p className="text-xs text-purple-600 mt-1">Above average</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {profile?.role || "Teacher"}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    ID: {profile?.id}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{profile?.email}</p>
                  </div>
                </div>
                
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{profile?.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-900">{getGenderText(profile?.gender)}</p>
                  </div>
                </div>
                
                {profile?.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900 line-clamp-1">{profile?.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/change-password"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
                
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                  <span className="px-2 py-1 bg-white/20 rounded text-xs">3</span>
                </button>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Assignment 3</p>
                    <p className="text-sm text-gray-600">CS101 - Due Tomorrow</p>
                  </div>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Midterm Grades</p>
                    <p className="text-sm text-gray-600">All Courses - Due in 3 days</p>
                  </div>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Main Dashboard Card */}
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
                    <p className="text-green-100">Manage courses, students, and grades</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  Professional Account
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.activeCourses}</div>
                  <div className="text-sm text-green-100">Active Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-sm text-green-100">Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.pendingGrades}</div>
                  <div className="text-sm text-green-100">To Grade</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                  <div className="text-sm text-green-100">Attendance</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
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
                {/* Courses Tab */}
                {activeTab === "courses" && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">My Courses</h3>
                        <p className="text-gray-600 mt-1">Manage your course allocations</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                          Export
                        </button>
                        <button className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                          + New Course
                        </button>
                      </div>
                    </div>

                    {myAllocations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Assigned</h3>
                        <p className="text-gray-600">You haven't been assigned to any courses yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myAllocations.map((allocation) => (
                          <div
                            key={allocation.id}
                            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                      {allocation.courses?.[0]?.name || "Unnamed Course"}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        Group: {allocation.group}
                                      </span>
                                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                        Semester: {allocation.semester || "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {allocation.courses_details && allocation.courses_details.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Course Details:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {allocation.courses_details.slice(0, 3).map((course) => (
                                        <div
                                          key={course.id}
                                          className="bg-gray-50 rounded-xl p-3"
                                        >
                                          <p className="font-medium text-gray-900">{course.title}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-600">Code: {course.code}</span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-gray-600">Credits: {course.credit}</span>
                                          </div>
                                          {course.summary && (
                                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                              {course.summary}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                      {allocation.courses_details.length > 3 && (
                                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center">
                                          <span className="text-sm text-gray-600">
                                            +{allocation.courses_details.length - 3} more courses
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Link
                                  to={`/teacher/grades/${allocation.id}`}
                                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
                                >
                                  <Award className="w-4 h-4" />
                                  Grades
                                </Link>
                                <Link
                                  to={`/teacher/attendance/${allocation.id}`}
                                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
                                >
                                  <Users className="w-4 h-4" />
                                  Attendance
                                </Link>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">~25 students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Mon/Wed 10:00 AM</span>
                                </div>
                              </div>
                              <Link
                                to={`/teacher/course/${allocation.id}`}
                                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                              >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
                      <p className="text-gray-600">Your teaching activities and updates</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4">Course Performance</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Avg. Grade</p>
                            <p className="text-2xl font-bold text-gray-900">84.5%</p>
                          </div>
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                            <p className="text-2xl font-bold text-gray-900">92%</p>
                          </div>
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Student Satisfaction</p>
                            <p className="text-2xl font-bold text-gray-900">4.7/5</p>
                          </div>
                          <div className="bg-white rounded-xl p-4">
                            <p className="text-sm text-gray-600 mb-1">Assignment Count</p>
                            <p className="text-2xl font-bold text-gray-900">18</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <a href="/teacher/schedule" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <span className="font-medium text-gray-900">Schedule</span>
                            </div>
                          </a>
                          <a href="/teacher/assignments" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-gray-900">Assignments</span>
                            </div>
                          </a>
                          <a href="/teacher/students" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-purple-600" />
                              <span className="font-medium text-gray-900">Students</span>
                            </div>
                          </a>
                          <a href="/teacher/analytics" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <BarChart3 className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-gray-900">Analytics</span>
                            </div>
                          </a>
                          <a href="/teacher/messages" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-5 h-5 text-pink-600" />
                              <span className="font-medium text-gray-900">Messages</span>
                            </div>
                          </a>
                          <a href="/teacher/resources" className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-teal-600" />
                              <span className="font-medium text-gray-900">Resources</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === "students" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Management</h3>
                    <p className="text-gray-600">View and manage your students from individual course pages</p>
                    <button className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                      View All Students
                    </button>
                  </div>
                )}

                {/* Grades Tab */}
                {activeTab === "grades" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Grade Management</h3>
                    <p className="text-gray-600">Access grade management from individual course pages</p>
                    <button className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                      View Grading Tasks
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Announcements</h3>
                <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Semester Schedule Update</p>
                    <p className="text-sm text-gray-600 mt-1">The final exam schedule has been updated. Please review the changes.</p>
                    <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">System Maintenance</p>
                    <p className="text-sm text-gray-600 mt-1">Scheduled maintenance this weekend. Save your work before 10 PM Friday.</p>
                    <p className="text-xs text-gray-500 mt-2">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} University LMS • Teacher Portal</p>
          <p className="mt-1">Need help? Contact support@university.edu</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;