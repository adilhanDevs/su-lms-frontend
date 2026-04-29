import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  ClipboardList,
  User,
  FileText,
} from "lucide-react";
import api from "../../api";

const MethodologistDashboard = () => {
  const [stats, setStats] = useState({ totalTeachers: 0, totalGroups: 0, totalPrograms: 0 });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, groupsRes, programsRes] = await Promise.all([
          api.get("/accounts/lecturers/"),
          api.get("/accounts/groups/"),
          api.get("/api/programs/"),
        ]);
        const teacherList = teachersRes.data || [];
        setTeachers(teacherList);
        setStats({
          totalTeachers: teacherList.length,
          totalGroups: groupsRes.data?.length || 0,
          totalPrograms: programsRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching methodologist stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickLinks = [
    {
      title: "Teacher Schedules",
      desc: "Monitor all lesson timings",
      icon: <Calendar className="w-6 h-6 text-indigo-600" />,
      path: "/methodologist/schedules",
      color: "indigo",
    },
    {
      title: "Educational Programs",
      desc: "Manage curriculum & courses",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      path: "/methodologist/programs",
      color: "emerald",
    },
    {
      title: "Academic Performance",
      desc: "View grades across groups",
      icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      path: "/methodologist/performance",
      color: "amber",
    },
    {
      title: "Courses",
      desc: "Manage courses & teacher assignments",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      path: "/methodologist/courses",
      color: "blue",
    },
    {
      title: "Documents",
      desc: "Review student document requests",
      icon: <FileText className="w-6 h-6 text-rose-600" />,
      path: "/methodologist/documents",
      color: "rose",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Methodologist Dashboard</h1>
          <p className="text-slate-500 mt-2">Oversee academic operations and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Teachers" value={stats.totalTeachers} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard label="Active Groups" value={stats.totalGroups} icon={<ClipboardList className="w-5 h-5" />} color="purple" />
          <StatCard label="Study Programs" value={stats.totalPrograms} icon={<BookOpen className="w-5 h-5" />} color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Management Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.path}
                  className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${link.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{link.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{link.desc}</p>
                  <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Explore <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="mt-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900">Academic Overview</h2>
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 outline-none">
                  <option>Current Semester</option>
                  <option>Last Semester</option>
                </select>
              </div>
              <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Performance Analytics Chart</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Real Teachers List */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Teachers
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : teachers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No teachers found</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {teachers.map(t => {
                    const u = t.lecturer || {};
                    const name = u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username || "—";
                    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-xs font-black shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                          {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link to="/methodologist/schedules"
                className="w-full mt-4 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 text-sm flex items-center justify-center gap-2">
                View Schedules <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
      <span className="text-emerald-500 bg-emerald-50 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3" /> +12%
      </span>
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
  </div>
);


export default MethodologistDashboard;
