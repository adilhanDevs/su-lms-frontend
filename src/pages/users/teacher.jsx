import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TeacherCalendarAttendance from "../crud/teacher/TeacherCalendarAttendance";
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
  ChevronRight,
  GraduationCap,
  Lock,
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  RefreshCw,
  MessageSquare,
  FileText,
} from "lucide-react";

const TeacherDashboard = () => {
  const [myAllocations, setMyAllocations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingGrades: 0,
    attendanceRate: 0,
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      setProfile(res.data);
    } catch (e) {
      console.error("profile error", e);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await api.get("api/teacher-allocations/");
      setMyAllocations(res.data || []);
      return res.data || [];
    } catch (e) {
      console.error("allocations error", e);
      return [];
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("api/notifications/");
      setNotifications(res.data || []);
    } catch (e) {
      console.error("notifications error", e);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await api.get("attendance/schedules/");
      setScheduleItems(res.data || []);
    } catch (e) {
      console.error("schedule error", e);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const res = await api.get("attendance/attendances/statistics/");
      return res.data?.attendance_rate ?? 0;
    } catch (e) {
      return 0;
    }
  };

  const computeStats = async (allocations) => {
    const groupIds = new Set();
    let courseCount = 0;
    allocations.forEach((a) => {
      if (a.group) groupIds.add(a.group);
      courseCount += a.courses_details?.length || a.courses?.length || 0;
    });

    let totalStudents = 0;
    for (const gid of groupIds) {
      try {
        const r = await api.get(`accounts/students/by-group/${gid}/`);
        totalStudents += (r.data || []).length;
      } catch {
        /* ignore */
      }
    }

    const attendanceRate = await fetchAttendanceStats();

    setStats({
      totalStudents,
      activeCourses: courseCount,
      pendingGrades: 0,
      attendanceRate: Math.round(attendanceRate),
    });
  };

  const fetchAllData = async () => {
    setLoading(true);
    await fetchProfile();
    const allocs = await fetchAllocations();
    await Promise.all([fetchNotifications(), fetchSchedule()]);
    await computeStats(allocs);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getGenderText = (g) =>
    g === "M" ? "Male" : g === "F" ? "Female" : "Not specified";

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "schedule", label: "Schedule", icon: <Calendar className="w-4 h-4" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      badge: notifications.filter((n) => !n.is_read).length,
    },
  ];

  const upcomingFromSchedule = scheduleItems
    .filter((s) => s.date && new Date(s.date) >= new Date(new Date().toDateString()))
    .slice(0, 3);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,{" "}
              <span className="text-green-600">
                {profile?.first_name || "Teacher"}!
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
              to="/change-password"
              className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
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
            value={stats.activeCourses}
            icon={<BookOpen className="w-6 h-6 text-green-600" />}
            tone="green"
          />
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            tone="blue"
          />
          <StatCard
            label="Pending Grades"
            value={stats.pendingGrades}
            icon={<Award className="w-6 h-6 text-yellow-600" />}
            tone="yellow"
          />
          <StatCard
            label="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
            tone="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile?.full_name}
                </h2>
                <span className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Teacher
                </span>
              </div>

              <ProfileRow icon={<Mail className="w-5 h-5 text-blue-600" />} label="Email" value={profile?.email || "—"} tone="blue" />
              {profile?.phone && (
                <ProfileRow icon={<Phone className="w-5 h-5 text-green-600" />} label="Phone" value={profile.phone} tone="green" />
              )}
              <ProfileRow icon={<User className="w-5 h-5 text-purple-600" />} label="Gender" value={getGenderText(profile?.gender)} tone="purple" />
              {profile?.address && (
                <ProfileRow icon={<MapPin className="w-5 h-5 text-orange-600" />} label="Address" value={profile.address} tone="orange" />
              )}
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/change-password" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/teacher/students" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>My Students</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/teacher/messages" className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </div>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="px-2 py-1 bg-white/20 rounded text-xs">
                      {notifications.filter((n) => !n.is_read).length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Classes</h3>
              <div className="space-y-3">
                {upcomingFromSchedule.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No upcoming classes in your schedule.
                  </p>
                )}
                {upcomingFromSchedule.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {s.course_title || s.course_name || `Course #${s.course}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {s.day} • {s.lesson_time_str || s.start_time || "—"}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
                    <p className="text-green-100">
                      Manage courses, students, and grades
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <HeroStat label="Courses" value={stats.activeCourses} />
                <HeroStat label="Students" value={stats.totalStudents} />
                <HeroStat label="To Grade" value={stats.pendingGrades} />
                <HeroStat label="Attendance" value={`${stats.attendanceRate}%`} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex gap-2 flex-wrap">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.badge > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <OverviewTab notifications={notifications.slice(0, 3)} />
                )}
                {activeTab === "courses" && <CoursesTab allocations={myAllocations} />}
                {activeTab === "schedule" && <ScheduleTab />}
                {activeTab === "messages" && (
                  <MessagesTab notifications={notifications} setNotifications={setNotifications} />
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
  <div className="flex items-center gap-3 mb-3">
    <div className={`w-10 h-10 rounded-lg bg-${tone}-50 flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

const HeroStat = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-green-100">{label}</div>
  </div>
);

const QuickLink = ({ to, icon, label }) => (
  <Link to={to} className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-gray-900">{label}</span>
    </div>
  </Link>
);

const OverviewTab = ({ notifications }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
      <p className="text-gray-600">Latest notifications and quick links</p>
    </div>
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
        <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickLink to="/teacher/schedule" icon={<Calendar className="w-5 h-5 text-blue-600" />} label="Schedule" />
          <QuickLink to="/teacher/students" icon={<Users className="w-5 h-5 text-purple-600" />} label="Students" />
          <QuickLink to="/teacher/messages" icon={<MessageSquare className="w-5 h-5 text-pink-600" />} label="Messages" />
          <QuickLink to="/teacher/courses" icon={<BookOpen className="w-5 h-5 text-teal-600" />} label="Courses" />
          <QuickLink to="/change-password" icon={<Lock className="w-5 h-5 text-amber-600" />} label="Password" />
          <QuickLink to="/" icon={<BarChart3 className="w-5 h-5 text-green-600" />} label="Dashboard" />
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-bold text-gray-900 mb-4">Latest Notifications</h4>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Bell className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-600">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const CoursesTab = ({ allocations }) => {
  if (!allocations.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No courses assigned yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {allocations.map((a) => (
        <div key={a.id} className="border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {a.courses_details?.[0]?.name || a.courses?.[0]?.name || "Course"}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Group: {a.group_name || a.group}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Semester: {a.semester_name || a.semester}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/teacher/grades/${a.id}`}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Award className="w-4 h-4" /> Grades
              </Link>
              <Link
                to={`/teacher/attendance/${a.id}`}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium"
              >
                <Users className="w-4 h-4" /> Attendance
              </Link>
              <Link
                to={`/teacher/course/${a.id}`}
                className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 flex items-center gap-2 font-medium"
              >
                <FileText className="w-4 h-4" /> Detail
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ScheduleTab = () => {
  return <TeacherCalendarAttendance />;
};

const MessagesTab = ({ notifications, setNotifications }) => {
  const markRead = async (id) => {
    try {
      await api.patch(`api/notifications/${id}/read/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!notifications.length) {
    return <p className="text-center py-12 text-gray-500">No messages.</p>;
  }
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.is_read && markRead(n.id)}
          className={`p-4 rounded-xl border cursor-pointer ${
            n.is_read ? "bg-gray-50 border-gray-100 opacity-70" : "bg-white border-blue-200 shadow-sm"
          }`}
        >
          <div className="flex items-start gap-3">
            <Bell className={`w-5 h-5 mt-1 ${n.is_read ? "text-gray-400" : "text-blue-600"}`} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900">{n.title}</p>
                <span className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherDashboard;
