import React from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3,
  UserPlus,
  FileText,
  Activity,
  LayoutDashboard,
  ChevronRight,
  Database,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  Shield,
  Key,
  GraduationCap,
  Briefcase,
  Layers,
  CalendarDays
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardContent = () => {
  // Django-style grouping of models
  const apps = [
    {
      name: "Accounts & Authentication",
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      models: [
        { name: "Lecturers", link: "/admin/create-lecturers", count: "24" },
        { name: "Students", link: "/admin/create-students", count: "842" },
        { name: "Groups", link: "/admin/groups", count: "18" },
      ]
    },
    {
      name: "Academic Core",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      models: [
        { name: "Programs", link: "/admin/courses", count: "6" },
        { name: "Academic Years", link: "/admin/courses", count: "3" },
        { name: "Semesters", link: "/admin/courses", count: "2" },
        { name: "Courses", link: "/admin/courses", count: "48" },
      ]
    },
    {
      name: "Operations & Scheduling",
      icon: <CalendarDays className="w-5 h-5 text-amber-500" />,
      models: [
        { name: "Class Schedule", link: "/admin/schedule", count: "Active" },
        { name: "Lesson Times", link: "/admin/lesson-times", count: "12 Slots" },
        { name: "Audit Logs", link: "/admin/audit-logs", count: "6.2k" },
      ]
    },
    {
      name: "Financial Management",
      icon: <Database className="w-5 h-5 text-rose-500" />,
      models: [
        { name: "Contracts", link: "/admin/contracts", count: "156" },
        { name: "Invoices", link: "/admin/invoices", count: "Pending" },
      ]
    }
  ];

  const recentActions = [
    { type: "ADD", model: "Lecturer", name: "Islam Makhmudov", time: "2 min ago", color: "emerald" },
    { type: "CHANGE", model: "Schedule", name: "Python Advanced", time: "45 min ago", color: "amber" },
    { type: "ADD", model: "Student", name: "Dilnaz K.", time: "1 hour ago", color: "emerald" },
    { type: "DELETE", model: "Course", name: "Legacy Ruby", time: "3 hours ago", color: "rose" },
    { type: "CHANGE", model: "Group", name: "Test Group 2026", time: "Yesterday", color: "amber" },
  ];

  return (
    <div className="p-8 flex-1 bg-[#f1f5f9]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
          <LayoutDashboard className="w-4 h-4" />
          <span>Site Administration</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Area (Like Django Index) */}
          <div className="lg:col-span-8 space-y-6">
            {apps.map((app, appIdx) => (
              <div key={appIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                  {app.icon}
                  <h2 className="font-black text-slate-800 tracking-tight uppercase text-sm">{app.name}</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {app.models.map((model, modelIdx) => (
                    <div key={modelIdx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors"></div>
                         <Link to={model.link} className="font-bold text-slate-700 hover:text-blue-600 transition-colors">
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

          {/* Sidebar Area (Recent Actions) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent Actions
              </h3>
              <div className="space-y-6">
                {recentActions.map((action, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full bg-${action.color}-500 mt-1.5`}></div>
                      {i !== recentActions.length - 1 && <div className="w-[1px] h-full bg-slate-100 my-1"></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase text-${action.color}-600 bg-${action.color}-50 px-1.5 py-0.5 rounded`}>
                          {action.type}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{action.name}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                        {action.model} • {action.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors uppercase tracking-widest">
                View My Actions
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2 text-blue-400">
                <Activity className="w-4 h-4" />
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link to="/change-password" title="Settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-bold">Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-bold">System Config</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;