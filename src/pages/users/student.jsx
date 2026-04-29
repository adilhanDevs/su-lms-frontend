import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  User,
  Mail,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Clock,
  ChevronRight,
  TrendingUp,
  Bell,
  LogOut,
  GraduationCap,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Zap,
} from "lucide-react";

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

const getGradeColor = (grade) => {
  const map = {
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
  return map[grade] || "bg-gray-200 text-gray-900";
};

const getGradeBadgeColor = (grade) => {
  if (["A+", "A", "A-"].includes(grade)) return "bg-emerald-100 text-emerald-800";
  if (["B+", "B", "B-"].includes(grade)) return "bg-blue-100 text-blue-800";
  if (["C+", "C", "C-"].includes(grade)) return "bg-yellow-100 text-yellow-800";
  if (["D", "F"].includes(grade)) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: [],
  });
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const stats = (() => {
    const allCourseIds = new Set([
      ...grades.first_module_grades.map((g) => g.course),
      ...grades.second_module_grades.map((g) => g.course),
      ...grades.semester_grades.map((g) => g.course),
    ]);

    let totalCoursesFromAlloc = 0;
    courses.forEach((alloc) => {
      totalCoursesFromAlloc +=
        alloc.courses_details?.length || alloc.courses?.length || 0;
    });
    const totalCourses = Math.max(allCourseIds.size, totalCoursesFromAlloc);

    let totalPoints = 0;
    let validGrades = 0;
    grades.semester_grades.forEach((g) => {
      if (g.grade && gradePoints[g.grade] !== undefined) {
        totalPoints += gradePoints[g.grade];
        validGrades++;
      }
    });
    const gpa = validGrades > 0 ? totalPoints / validGrades : 0;

    let attendanceRate = 0;
    if (attendance.length > 0) {
      const present = attendance.filter((a) => a.status).length;
      attendanceRate = Math.round((present / attendance.length) * 100);
    }

    const pendingAssignments = grades.semester_grades.filter((g) =>
      ["D", "F", null, undefined].includes(g.grade)
    ).length;

    return {
      totalCourses,
      gpa: parseFloat(gpa.toFixed(2)),
      attendanceRate,
      pendingAssignments,
    };
  })();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await api.get("accounts/profile/");
      setProfile(profileRes.data);

      const [gradesRes, attendanceRes, scheduleRes, notifRes] =
        await Promise.allSettled([
          api.get("result/api/grade-semesters/my_all_grades/"),
          api.get("attendance/attendances/my_attendance/"),
          api.get("attendance/schedules/"),
          api.get("api/notifications/"),
        ]);

      if (gradesRes.status === "fulfilled") setGrades(gradesRes.value.data);
      if (attendanceRes.status === "fulfilled")
        setAttendance(attendanceRes.value.data || []);
      if (scheduleRes.status === "fulfilled")
        setScheduleItems(scheduleRes.value.data || []);
      if (notifRes.status === "fulfilled")
        setNotifications(notifRes.value.data || []);

      const groupId = profileRes.data?.student_data?.group?.id;
      if (groupId) {
        try {
          const r = await api.get(`api/course-allocations/group/${groupId}/`);
          setCourses(r.data || []);
        } catch (e) {
          console.error("course allocations error", e);
        }
      }
    } catch (e) {
      console.error("Student dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const upcomingClasses = scheduleItems
    .filter((s) => s.date && new Date(s.date) >= new Date(new Date().toDateString()))
    .slice(0, 3);

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
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "grades", label: "Grades", icon: <Award className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,{" "}
              <span className="text-blue-600">
                {profile?.first_name || "Student"}!
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
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
            <Link
              to="/student/messages"
              className="relative p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </Link>
            <Link
              to="/logout"
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center gap-2 font-medium shadow-lg shadow-red-500/25 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active Courses"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            tone="blue"
          />
          <StatCard
            label="Current GPA"
            value={stats.gpa.toFixed(2)}
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            tone="emerald"
          />
          <StatCard
            label="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
            tone="purple"
          />
          <StatCard
            label="Need Attention"
            value={stats.pendingAssignments}
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            tone="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.full_name}
                </h2>
                <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Student
                </span>
              </div>

              <div className="space-y-4">
                {profile?.student_data?.group?.program?.name && (
                  <ProfileRow
                    icon={<BookOpen className="w-5 h-5 text-purple-600" />}
                    label="Program"
                    value={profile.student_data.group.program.name}
                    tone="purple"
                  />
                )}
                {profile?.student_data?.group?.name && (
                  <ProfileRow
                    icon={<Users className="w-5 h-5 text-green-600" />}
                    label="Group"
                    value={profile.student_data.group.name}
                    tone="green"
                  />
                )}
                <ProfileRow
                  icon={<Mail className="w-5 h-5 text-gray-600" />}
                  label="Email"
                  value={profile?.email || "—"}
                  tone="gray"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/student/schedule"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>View Schedule</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/student/attendance"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Attendance</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/student/finance"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <span>My Finances</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/student/documents"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" />
                    <span>My Documents</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/change-password"
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Classes</h3>
              <div className="space-y-3">
                {upcomingClasses.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No upcoming classes scheduled.
                  </p>
                )}
                {upcomingClasses.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {s.course_title || s.course_name || `Course #${s.course}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {s.day} • {s.lesson_time_str || s.start_time || "—"}
                      </p>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <HeroStat label="Active Courses" value={stats.totalCourses} />
                <HeroStat label="GPA" value={stats.gpa.toFixed(2)} />
                <HeroStat label="Attendance" value={`${stats.attendanceRate}%`} />
                <HeroStat label="Needs Attention" value={stats.pendingAssignments} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex gap-2 flex-wrap">
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
                {activeTab === "overview" && <OverviewTab notifications={notifications} />}
                {activeTab === "grades" && <GradesTab grades={grades} />}
                {activeTab === "courses" && <CoursesTab courses={courses} />}
                {activeTab === "attendance" && (
                  <AttendanceTab attendance={attendance} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, tone }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-${tone}-100 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

const ProfileRow = ({ icon, label, value, tone }) => (
  <div className={`flex items-center gap-3 p-3 bg-${tone}-50 rounded-xl`}>
    <div className={`w-10 h-10 rounded-lg bg-${tone}-100 flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const HeroStat = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-blue-100">{label}</div>
  </div>
);

const OverviewTab = ({ notifications }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-gray-900">Latest Notifications</h3>
    {notifications.length === 0 && (
      <p className="text-gray-500">No notifications yet.</p>
    )}
    {notifications.slice(0, 5).map((n) => (
      <div
        key={n.id}
        className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3"
      >
        <Bell className="w-5 h-5 text-blue-600 mt-1" />
        <div>
          <p className="font-medium text-gray-900">{n.title}</p>
          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(n.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const GradesTab = ({ grades }) => (
  <div>
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Academic Grades</h3>
        <p className="text-gray-600">View your semester and module grades</p>
      </div>
      <Link
        to="/student/grades"
        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Full Transcript
      </Link>
    </div>

    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Award className="w-5 h-5 text-blue-600" />
      Semester Grades
    </h4>
    {grades.semester_grades.length === 0 ? (
      <div className="text-center py-8 bg-gray-50 rounded-2xl">
        <p className="text-gray-600">No semester grades yet.</p>
      </div>
    ) : (
      <div className="space-y-4 mb-8">
        {grades.semester_grades.map((g) => (
          <div
            key={g.id}
            className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h5 className="text-lg font-bold text-gray-900">{g.course_title}</h5>
                <p className="text-sm text-gray-600">
                  {g.course_code && (
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {g.course_code}
                    </span>
                  )}{" "}
                  Lecturer: {g.lecturer_name}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <Stat label="Attendance" value={g.attendance} />
                  <Stat label="Activities" value={g.activities} />
                  <Stat label="Exam" value={g.exam} />
                  <Stat label="Total" value={g.total} highlight />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`px-6 py-3 rounded-xl font-bold text-xl ${getGradeColor(g.grade)}`}>
                  {g.grade}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeBadgeColor(
                    g.grade
                  )}`}
                >
                  {g.semester_name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ModuleColumn
        title="First Module"
        items={grades.first_module_grades}
        accent="text-blue-600"
      />
      <ModuleColumn
        title="Second Module"
        items={grades.second_module_grades}
        accent="text-purple-600"
      />
    </div>
  </div>
);

const ModuleColumn = ({ title, items, accent }) => (
  <div>
    <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${accent}`}>
      <Zap className="w-5 h-5" />
      {title}
    </h4>
    {items.length === 0 ? (
      <div className="text-center py-6 bg-gray-50 rounded-2xl">
        <p className="text-gray-600">No grades</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((g) => (
          <div key={g.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{g.course_title}</p>
                <p className="text-sm text-gray-600">Total: {g.total}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg font-bold ${getGradeBadgeColor(g.grade)}`}
              >
                {g.grade}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Stat = ({ label, value, highlight }) => (
  <div className={`rounded-xl p-3 ${highlight ? "bg-blue-50" : "bg-gray-50"}`}>
    <p className={`text-xs mb-1 ${highlight ? "text-blue-600" : "text-gray-600"}`}>
      {label}
    </p>
    <p className={`font-semibold ${highlight ? "text-blue-700" : "text-gray-900"}`}>
      {value}
    </p>
  </div>
);

const CoursesTab = ({ courses }) => {
  if (!courses.length) {
    return <p className="text-center py-12 text-gray-500">No courses yet.</p>;
  }
  return (
    <div className="space-y-3">
      {courses.flatMap((alloc) =>
        (alloc.courses_details || alloc.courses || []).map((c) => (
          <div
            key={`${alloc.id}-${c.id || c.name}`}
            className="border border-gray-200 rounded-xl p-4"
          >
            <p className="font-bold text-gray-900">{c.name || c.title}</p>
            <p className="text-sm text-gray-600">
              Lecturer: {alloc.lecturer_name || alloc.lecturer || "—"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

const AttendanceTab = ({ attendance }) => {
  if (!attendance.length) {
    return <p className="text-center py-12 text-gray-500">No attendance records.</p>;
  }
  const present = attendance.filter((a) => a.status).length;
  const total = attendance.length;
  return (
    <div>
      <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
        <p className="text-sm text-emerald-700">
          Present {present} of {total} sessions • {Math.round((present / total) * 100)}%
        </p>
      </div>
      <div className="space-y-2">
        {attendance.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div>
              <p className="font-medium text-gray-900">
                {a.shcedule_course_title || a.shcedule || `Session #${a.id}`}
              </p>
              <p className="text-xs text-gray-500">
                {a.shcedule_day} • {a.shcedule_lesson_time}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                a.status ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {a.status ? "Present" : "Absent"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
