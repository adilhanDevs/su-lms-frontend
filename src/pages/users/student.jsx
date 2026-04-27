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
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Bookmark,
  Target,
  Star,
  Zap,
  Loader2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Download,
  Eye,
} from "lucide-react";

const StudentDashboard = () => {
  const [myGrades, setMyGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: [],
  });
  const [profile, setProfile] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalCourses: 0,
    gpa: 0,
    attendanceRate: 0,
    pendingAssignments: 0,
  });

  // Функция для получения всех оценок студента
  const fetchAllGrades = async () => {
    try {
      const res = await api.get("result/api/grade-semesters/my_all_grades/");
      console.log("Student grades loaded:", res.data);
      setMyGrades(res.data);
      return res.data;
    } catch (e) {
      console.error("Error loading grades:", e);
      return {
        first_module_grades: [],
        second_module_grades: [],
        semester_grades: [],
      };
    }
  };

  // Функция для получения курсов студента по группе
  const fetchMyCourses = async (groupId) => {
    try {
      const res = await api.get(`api/course-allocations/group/${groupId}/`);
      console.log("Student courses loaded:", res.data);
      setMyCourses(res.data);
      return res.data;
    } catch (e) {
      console.error("Error loading courses:", e);
      return [];
    }
  };

  const calculateStats = (gradesData, coursesData = []) => {
    // Подсчитываем уникальные курсы из оценок
    const allCoursesFromGrades = new Set([
      ...gradesData.first_module_grades.map((g) => g.course),
      ...gradesData.second_module_grades.map((g) => g.course),
      ...gradesData.semester_grades.map((g) => g.course),
    ]);

    // Подсчитываем общее количество курсов из course allocations
    let totalCoursesCount = 0;
    coursesData.forEach((allocation) => {
      if (allocation.courses && Array.isArray(allocation.courses)) {
        totalCoursesCount += allocation.courses.length;
      }
    });

    // Используем максимум из двух источников
    const totalCourses = Math.max(allCoursesFromGrades.size, totalCoursesCount);

    const gradePoints = {
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      D: 1.0,
      F: 0.0,
    };

    const semesterGrades = gradesData.semester_grades;
    let totalPoints = 0;
    let validGrades = 0;

    semesterGrades.forEach((grade) => {
      if (grade.grade && gradePoints[grade.grade] !== undefined) {
        totalPoints += gradePoints[grade.grade];
        validGrades++;
      }
    });

    const gpa = validGrades > 0 ? totalPoints / validGrades : 0;
    const pendingAssignments = semesterGrades.filter((g) =>
      ["D", "F", null, undefined].includes(g.grade)
    ).length;

    setStats({
      totalCourses,
      gpa: parseFloat(gpa.toFixed(2)),
      attendanceRate: 94, // Mock data
      pendingAssignments,
    });
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем профиль с данными студента
      const profileRes = await api.get("accounts/profile/");
      console.log("Profile loaded:", profileRes.data);
      setProfile(profileRes.data);
      
      // Получаем оценки
      const gradesData = await fetchAllGrades();
      
      // Получаем курсы если есть данные студента
      let coursesData = [];
      if (profileRes.data?.student_data?.group?.id) {
        console.log("Fetching courses for group:", profileRes.data.student_data.group.id);
        coursesData = await fetchMyCourses(profileRes.data.student_data.group.id);
      } else {
        console.log("No student data found in profile:", profileRes.data);
      }
      
      // Подсчитываем статистику с учетом курсов
      calculateStats(gradesData, coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getGradeColor = (grade) => {
    const gradeColors = {
      "A+": "bg-emerald-500 text-white",
      A: "bg-emerald-400 text-white",
      "A-": "bg-emerald-300 text-emerald-900",
      "B+": "bg-blue-400 text-white",
      B: "bg-blue-300 text-blue-900",
      "B-": "bg-blue-200 text-blue-900",
      "C+": "bg-yellow-300 text-yellow-900",
      C: "bg-yellow-400 text-yellow-900",
      "C-": "bg-yellow-500 text-yellow-900",
      D: "bg-orange-400 text-orange-900",
      F: "bg-red-500 text-white",
    };
    return gradeColors[grade] || "bg-gray-200 text-gray-900";
  };

  const getGradeBadgeColor = (grade) => {
    if (["A+", "A", "A-"].includes(grade))
      return "bg-emerald-100 text-emerald-800";
    if (["B+", "B", "B-"].includes(grade)) return "bg-blue-100 text-blue-800";
    if (["C+", "C", "C-"].includes(grade))
      return "bg-yellow-100 text-yellow-800";
    if (["D", "F"].includes(grade)) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    { id: "grades", label: "Grades", icon: <Award className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    {
      id: "performance",
      label: "Performance",
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,{" "}
              <span className="text-blue-600">
                {profile?.first_name || "Student"}!
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              Track your academic progress and performance
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
              <Bell className="w-5 h-5 text-gray-600" />
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
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
                </p>
                <p className="text-xs text-green-600 mt-1">+1 this semester</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Current GPA
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.gpa.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  +0.15 from last term
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.attendanceRate}%
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Perfect this week
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Need Attention
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingAssignments}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Review required</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {profile?.user_role || "Student"}
                  </span>
                  {profile?.id && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      ID: {profile?.id}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {profile?.student_data?.group?.program?.name && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Program</p>
                      <p className="font-medium text-gray-900">
                        {profile.student_data.group.program.name}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.student_data?.group?.name && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Group</p>
                      <p className="font-medium text-gray-900">
                        {profile.student_data.group.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {profile?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/student/schedule"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>View Schedule</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="/student/attendance"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Attendance</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="/change-password"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Math Assignment</p>
                    <p className="text-sm text-gray-600">Due Tomorrow</p>
                  </div>
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Physics Lab Report
                    </p>
                    <p className="text-sm text-gray-600">Due in 3 days</p>
                  </div>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">English Essay</p>
                    <p className="text-sm text-gray-600">Due Next Week</p>
                  </div>
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Main Dashboard Card */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Academic Dashboard</h2>
                    <p className="text-blue-100">
                      Track your grades and performance
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  Student Portal
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <div className="text-sm text-blue-100">Active Courses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {stats.gpa.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-100">GPA</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {stats.attendanceRate}%
                  </div>
                  <div className="text-sm text-blue-100">Attendance</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">
                    {stats.pendingAssignments}
                  </div>
                  <div className="text-sm text-blue-100">Needs Attention</div>
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
                {/* Grades Tab */}
                {activeTab === "grades" && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Academic Grades
                        </h3>
                        <p className="text-gray-600 mt-1">
                          View your semester and module grades
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Transcript
                        </button>
                      </div>
                    </div>

                    {/* Semester Grades */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        Semester Grades
                      </h4>

                      {myGrades.semester_grades.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Semester Grades
                          </h3>
                          <p className="text-gray-600">
                            Your semester grades will appear here when available
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myGrades.semester_grades.map((grade) => (
                            <div
                              key={grade.id}
                              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                      <BookOpen className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                      <h5 className="text-lg font-bold text-gray-900">
                                        {grade.course_title}
                                      </h5>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                          {grade.course_code}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          Lecturer: {grade.lecturer_name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <p className="text-xs text-gray-600 mb-1">
                                        Attendance
                                      </p>
                                      <p className="font-semibold text-gray-900">
                                        {grade.attendance}
                                      </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <p className="text-xs text-gray-600 mb-1">
                                        Activities
                                      </p>
                                      <p className="font-semibold text-gray-900">
                                        {grade.activities}
                                      </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <p className="text-xs text-gray-600 mb-1">
                                        Exam
                                      </p>
                                      <p className="font-semibold text-gray-900">
                                        {grade.exam}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-3">
                                      <p className="text-xs text-blue-600 mb-1">
                                        Total
                                      </p>
                                      <p className="font-semibold text-blue-700">
                                        {grade.total}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div
                                    className={`px-6 py-3 rounded-xl font-bold text-xl ${getGradeColor(
                                      grade.grade
                                    )}`}
                                  >
                                    {grade.grade}
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeBadgeColor(
                                      grade.grade
                                    )}`}
                                  >
                                    {grade.semester_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Module Grades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          First Module
                        </h4>
                        {myGrades.first_module_grades.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-2xl">
                            <p className="text-gray-600">
                              No first module grades
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myGrades.first_module_grades.map((grade) => (
                              <div
                                key={grade.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {grade.course_title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Total: {grade.total}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-lg font-bold ${getGradeBadgeColor(
                                      grade.grade
                                    )}`}
                                  >
                                    {grade.grade}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-purple-600" />
                          Second Module
                        </h4>
                        {myGrades.second_module_grades.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-2xl">
                            <p className="text-gray-600">
                              No second module grades
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myGrades.second_module_grades.map((grade) => (
                              <div
                                key={grade.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {grade.course_title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Total: {grade.total}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-lg font-bold ${getGradeBadgeColor(
                                      grade.grade
                                    )}`}
                                  >
                                    {grade.grade}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Academic Overview
                      </h3>
                      <p className="text-gray-600">
                        Your overall academic performance summary
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Performance Summary */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4">
                          Grade Distribution
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-emerald-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-700 mb-1">
                              {
                                myGrades.semester_grades.filter((g) =>
                                  ["A+", "A", "A-"].includes(g.grade)
                                ).length
                              }
                            </div>
                            <p className="text-sm font-medium text-emerald-600">
                              Excellent
                            </p>
                            <p className="text-xs text-emerald-500 mt-1">
                              A/A-/A+
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-700 mb-1">
                              {
                                myGrades.semester_grades.filter((g) =>
                                  ["B+", "B", "B-"].includes(g.grade)
                                ).length
                              }
                            </div>
                            <p className="text-sm font-medium text-blue-600">
                              Good
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              B/B-/B+
                            </p>
                          </div>
                          <div className="bg-yellow-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-700 mb-1">
                              {
                                myGrades.semester_grades.filter((g) =>
                                  ["C+", "C", "C-"].includes(g.grade)
                                ).length
                              }
                            </div>
                            <p className="text-sm font-medium text-yellow-600">
                              Satisfactory
                            </p>
                            <p className="text-xs text-yellow-500 mt-1">
                              C/C-/C+
                            </p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-700 mb-1">
                              {
                                myGrades.semester_grades.filter((g) =>
                                  ["D", "F", null, undefined].includes(g.grade)
                                ).length
                              }
                            </div>
                            <p className="text-sm font-medium text-red-600">
                              Need Help
                            </p>
                            <p className="text-xs text-red-500 mt-1">D/F</p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-900 mb-4">
                          Quick Access
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <a
                            href="/student/courses"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <span className="font-medium text-gray-900">
                                My Courses
                              </span>
                            </div>
                          </a>
                          <a
                            href="/student/assignments"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-gray-900">
                                Assignments
                              </span>
                            </div>
                          </a>
                          <a
                            href="/student/schedule"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              <span className="font-medium text-gray-900">
                                Schedule
                              </span>
                            </div>
                          </a>
                          <a
                            href="/student/resources"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <Bookmark className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-gray-900">
                                Resources
                              </span>
                            </div>
                          </a>
                          <a
                            href="/student/messages"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-5 h-5 text-pink-600" />
                              <span className="font-medium text-gray-900">
                                Messages
                              </span>
                            </div>
                          </a>
                          <a
                            href="/student/analytics"
                            className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <BarChart3 className="w-5 h-5 text-teal-600" />
                              <span className="font-medium text-gray-900">
                                Analytics
                              </span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Tab */}
                {activeTab === "performance" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Performance Analytics
                    </h3>
                    <p className="text-gray-600">
                      Detailed performance analytics coming soon
                    </p>
                    <button className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                      View Progress Report
                    </button>
                  </div>
                )}

                {/* Courses Tab */}
                {activeTab === "courses" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        My Courses
                      </h3>
                      <p className="text-gray-600">
                        {myCourses.length > 0
                          ? `You are enrolled in ${myCourses.length} course allocation(s)`
                          : "No courses found"}
                      </p>
                    </div>

                    {myCourses.length > 0 ? (
                      <div className="space-y-4">
                        {myCourses.map((allocation) => (
                          <div
                            key={allocation.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {allocation.semester || "N/A"}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Group: {allocation.group || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  Lecturer: {allocation.lecturer || "N/A"}
                                </p>
                              </div>
                            </div>

                            {allocation.courses && allocation.courses.length > 0 ? (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Courses ({allocation.courses.length}):
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {allocation.courses.map((course) => (
                                    <div
                                      key={course.id}
                                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <div>
                                        <p className="font-medium text-gray-900 text-sm">
                                          {course.name}
                                        </p>
                                        {course.credit && (
                                          <p className="text-xs text-gray-600">
                                            {course.credit} credits
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No courses assigned to this allocation
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">
                          No course allocations found for your group
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Assignment Submitted
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      You submitted "Math Problem Set 3"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Grade Updated</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Physics grade updated to A-
                    </p>
                    <p className="text-xs text-gray-500 mt-2">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} University LMS • Student Portal</p>
          <p className="mt-1">Academic Advisor: advisor@university.edu</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
