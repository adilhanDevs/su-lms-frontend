import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell,
  Search,
  UserPlus,
  Key,
  Database,
  Receipt,
  UserCheck,
  ScrollText,
  CreditCard,
  Layers,
  CheckSquare,
  UserCog,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { role } = useAuth();

  const adminMenuItems = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, link: "/" },
    { title: "Lecturers", icon: <UserPlus className="w-5 h-5" />, link: "/admin/create-lecturers" },
    { title: "Students", icon: <Users className="w-5 h-5" />, link: "/admin/create-students" },
    { title: "Parents", icon: <UserCheck className="w-5 h-5" />, link: "/admin/parents" },
    { title: "Courses", icon: <BookOpen className="w-5 h-5" />, link: "/admin/courses" },
    { title: "Groups", icon: <Database className="w-5 h-5" />, link: "/admin/groups" },
    { title: "Schedule", icon: <Calendar className="w-5 h-5" />, link: "/admin/schedule" },
    { title: "Lesson Times", icon: <Clock className="w-5 h-5" />, link: "/admin/lesson-times" },
    { title: "Invoices", icon: <Receipt className="w-5 h-5" />, link: "/admin/invoices" },
    { title: "Contracts", icon: <FileText className="w-5 h-5" />, link: "/admin/contracts" },
    { title: "Audit Logs", icon: <ScrollText className="w-5 h-5" />, link: "/admin/audit-logs" },
    { title: "Staff", icon: <UserCog className="w-5 h-5" />, link: "/admin/staff" },
  ];

  const methodologistMenuItems = [
    { title: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, link: "/" },
    { title: "All Schedules", icon: <Calendar className="w-5 h-5" />, link: "/methodologist/schedules" },
    { title: "Programs", icon: <BookOpen className="w-5 h-5" />, link: "/methodologist/programs" },
    { title: "Courses", icon: <Layers className="w-5 h-5" />, link: "/methodologist/courses" },
    { title: "Documents", icon: <FileText className="w-5 h-5" />, link: "/methodologist/documents" },
    { title: "Performance", icon: <BarChart3 className="w-5 h-5" />, link: "/methodologist/performance" },
  ];

  const accountantMenuItems = [
    { title: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, link: "/" },
    { title: "Programs", icon: <Layers className="w-5 h-5" />, link: "/accountant/programs" },
    { title: "Verify Payments", icon: <CheckSquare className="w-5 h-5" />, link: "/accountant/verify" },
    { title: "Contracts", icon: <FileText className="w-5 h-5" />, link: "/accountant/contracts" },
  ];

  const menuItems =
    role === 'admin' ? adminMenuItems :
    role === 'accountant' ? accountantMenuItems :
    methodologistMenuItems;

  const panelTitle =
    role === 'admin' ? "ADMIN PANEL" :
    role === 'accountant' ? "FINANCE" :
    "METHODOLOGIST";

  const panelIcon =
    role === 'admin' ? <Shield className="w-5 h-5 text-white" /> :
    role === 'accountant' ? <CreditCard className="w-5 h-5 text-white" /> :
    <BarChart3 className="w-5 h-5 text-white" />;

  const panelColor =
    role === 'admin' ? "bg-blue-600" :
    role === 'accountant' ? "bg-emerald-600" :
    "bg-indigo-600";

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#0f172a] text-slate-300 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "hidden"}`}>
            <div className={`w-8 h-8 ${panelColor} rounded-lg flex items-center justify-center`}>
              {panelIcon}
            </div>
            <span className="font-bold text-white tracking-tight">{panelTitle}</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive(item.link) 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                  : "hover:bg-slate-800/50 hover:text-white"
              } ${!sidebarOpen && "justify-center"}`}
              title={item.title}
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/logout"
            className={`flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all ${!sidebarOpen && "justify-center"}`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} min-h-screen flex flex-col`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap">
              {panelIcon}
              <span>{role}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900">{location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search models..." 
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider hidden sm:block">
              View Site
            </Link>
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
