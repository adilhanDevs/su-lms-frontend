import React, { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  ChevronRight,
  Database,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  Shield,
  Key,
  CalendarDays,
  Activity,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";

const formatRelative = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString();
};

const AdminDashboardContent = () => {
  const [counts, setCounts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/accounts/admin/stats/");
        if (!alive) return;
        setCounts(res.data.counts || {});
        setRecent(res.data.recent || []);
      } catch (e) {
        console.error("Failed to load admin stats:", e);
        if (alive) setError("Failed to load stats");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const c = counts || {};

  const apps = [
    {
      name: "Accounts & Authentication",
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      models: [
        { name: "Lecturers", link: "/admin/create-lecturers", count: c.lecturers ?? "—" },
        { name: "Students", link: "/admin/create-students", count: c.students ?? "—" },
        { name: "Groups", link: "/admin/groups", count: c.groups ?? "—" },
        { name: "Parents", link: "/admin/parents", count: c.parents ?? "—" },
      ],
    },
    {
      name: "Academic Core",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      models: [
        { name: "Programs", link: "/admin/courses", count: c.programs ?? "—" },
        { name: "Academic Years", link: "/admin/courses", count: c.academic_years ?? "—" },
        { name: "Semesters", link: "/admin/courses", count: c.semesters ?? "—" },
        { name: "Courses", link: "/admin/courses", count: c.courses ?? "—" },
      ],
    },
    {
      name: "Operations & Scheduling",
      icon: <CalendarDays className="w-5 h-5 text-amber-500" />,
      models: [
        { name: "Class Schedule", link: "/admin/schedule", count: c.schedule_items ?? "—" },
        { name: "Lesson Times", link: "/admin/lesson-times", count: c.lesson_times ?? "—" },
        { name: "Audit Logs", link: "/admin/audit-logs", count: c.notifications ?? 0 },
      ],
    },
    {
      name: "Financial Management",
      icon: <Database className="w-5 h-5 text-rose-500" />,
      models: [
        { name: "Contracts", link: "/admin/contracts", count: c.contracts ?? "—" },
        {
          name: "Invoices",
          link: "/admin/invoices",
          count:
            c.pending_invoices > 0
              ? `${c.pending_invoices} pending`
              : c.invoices ?? "—",
        },
      ],
    },
  ];

  return (
    <div className="p-8 flex-1 bg-[#f1f5f9]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
          <LayoutDashboard className="w-4 h-4" />
          <span>Site Administration</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {error && <span className="text-rose-500 normal-case">{error}</span>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {apps.map((app, appIdx) => (
              <div
                key={appIdx}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  {app.icon}
                  <h2 className="font-black text-slate-800 tracking-tight uppercase text-sm">
                    {app.name}
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {app.models.map((model, modelIdx) => (
                    <div
                      key={modelIdx}
                      className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors"></div>
                        <Link
                          to={model.link}
                          className="font-bold text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          {model.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                          {model.count}
                        </span>
                        <div className="flex gap-2">
                          <Link
                            to={`${model.link}?action=add`}
                            className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </Link>
                          <Link
                            to={model.link}
                            className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" /> Change
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent Actions
              </h3>
              <div className="space-y-6">
                {recent.length === 0 && !loading && (
                  <p className="text-xs text-slate-400 font-bold">
                    No recent actions yet.
                  </p>
                )}
                {recent.map((action, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full bg-${action.color}-500 mt-1.5`}
                      ></div>
                      {i !== recent.length - 1 && (
                        <div className="w-[1px] h-full bg-slate-100 my-1"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[8px] font-black uppercase text-${action.color}-600 bg-${action.color}-50 px-1.5 py-0.5 rounded`}
                        >
                          {action.type}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {action.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                        {action.model} • {formatRelative(action.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/admin/audit-logs"
                className="mt-8 block text-center py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors uppercase tracking-widest"
              >
                View Audit Log
              </Link>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2 text-blue-400">
                <Activity className="w-4 h-4" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  to="/change-password"
                  title="Change password"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-bold">Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
                <Link
                  to="/admin/invoices"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-bold">Manage Invoices</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
