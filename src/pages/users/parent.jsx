import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  User,
  Mail,
  Phone,
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
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  PieChart,
  Calendar,
  CreditCard,
  History,
  Activity,
  Heart,
  Baby,
  Upload,
  Send,
  XCircle,
  Info,
  X,
  Loader2,
} from "lucide-react";

const ParentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [childData, setChildData] = useState({
    grades: {
      first_module_grades: [],
      second_module_grades: [],
      semester_grades: [],
    },
    attendance: [],
    finance: {
      invoices: [],
      payments: [],
      balance: null
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount: "", receipt: null });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await api.get("accounts/profile/");
      setProfile(profileRes.data);
      
      const childrenList = profileRes.data.children || [];
      setChildren(childrenList);
      
      if (childrenList.length > 0 && !selectedChild) {
        setSelectedChild(childrenList[0]);
      }

      // Fetch Notifications
      const notifRes = await api.get("api/notifications/");
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Error fetching parent profile:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  const fetchChildDetails = useCallback(async (childId) => {
    if (!childId) return;

    const [gradesRes, attendanceRes, invoicesRes, paymentsRes, balanceRes] = await Promise.allSettled([
      api.get(`result/api/grade-semesters/my_all_grades/?student=${childId}`),
      api.get(`attendance/attendances/?student=${childId}`),
      api.get(`finance/my/invoices/?student=${childId}`),
      api.get(`finance/my/payments/?student=${childId}`),
      api.get(`finance/my/balance/?student=${childId}`),
    ]);

    const val = (res, fallback) => res.status === 'fulfilled' ? res.value.data : fallback;

    const gradesData = val(gradesRes, null);
    setChildData({
      grades: Array.isArray(gradesData) ? gradesData.find(g => g.student_id === childId) || gradesData[0] : gradesData,
      attendance: val(attendanceRes, []),
      finance: {
        invoices: val(invoicesRes, []),
        payments: val(paymentsRes, []),
        balance: (() => {
          const b = val(balanceRes, null);
          return Array.isArray(b) ? b.find(x => x.student_id === childId) || b[0] : b;
        })(),
      },
    });
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDetails(selectedChild.id);
    }
  }, [selectedChild, fetchChildDetails]);

  const openPayModal = (invoice) => {
    const remaining = Number(invoice.amount) - Number(invoice.total_paid || 0);
    setPayForm({ amount: remaining > 0 ? String(remaining) : String(invoice.amount), receipt: null });
    setPayModal(invoice);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }
    if (!payForm.receipt) {
      setMessage({ type: "error", text: "Please attach a receipt" });
      return;
    }
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("invoice", payModal.id);
    formData.append("student", selectedChild.id);
    formData.append("amount", payForm.amount);
    formData.append("payment_method", "transfer");
    formData.append("receipt", payForm.receipt);
    formData.append("comment", "Receipt uploaded via Parent Portal");
    try {
      await api.post("finance/my/payments/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage({ type: "success", text: "Receipt sent! Awaiting accountant verification." });
      setPayModal(null);
      fetchChildDetails(selectedChild.id);
    } catch (err) {
      console.error("Payment error:", err);
      setMessage({ type: "error", text: "Failed to submit receipt." });
    } finally {
      setUploadLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`api/notifications/${id}/read/`, { is_read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const computeGpa = () => {
    const gp = {
      "A+": 4.0, A: 4.0, "A-": 3.7,
      "B+": 3.3, B: 3.0, "B-": 2.7,
      "C+": 2.3, C: 2.0, "C-": 1.7,
      D: 1.0, F: 0.0,
    };
    const semesterGrades = childData.grades?.semester_grades || [];
    let total = 0, n = 0;
    semesterGrades.forEach((g) => {
      if (g.grade && gp[g.grade] !== undefined) {
        total += gp[g.grade];
        n++;
      }
    });
    return n > 0 ? (total / n).toFixed(2) : "—";
  };

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

  const tabs = [
    { id: "overview", label: "Overview", icon: <PieChart className="w-4 h-4" /> },
    { id: "grades", label: "Grades", icon: <Award className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <Calendar className="w-4 h-4" /> },
    { id: "finance", label: "Finance", icon: <DollarSign className="w-4 h-4" /> },
    { id: "notifications", label: "Alerts", icon: <Bell className="w-4 h-4" />, badge: notifications.filter(n => !n.is_read).length },
  ];

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Hello, <span className="text-orange-600">{profile?.first_name || "Parent"}</span>
              </h1>
              <p className="text-slate-500 font-medium italic">Parental Monitoring System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 px-3 uppercase tracking-widest">Children:</span>
              <div className="flex gap-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                      selectedChild?.id === child.id 
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {child.full_name?.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <Link to="/logout" className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
              <LogOut className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <p className="font-bold text-sm">{message.text}</p>
          </div>
        )}

        {selectedChild ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
               {/* Child Profile Card */}
               <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 text-center">
                 <div className="w-24 h-24 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-slate-200">
                   {selectedChild.full_name?.[0]}
                 </div>
                 <h2 className="text-xl font-black text-slate-900 mb-1">{selectedChild.full_name}</h2>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">{selectedChild.group?.name}</p>
                 
                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Academic Standing</p>
                    <div className="flex items-center justify-between">
                       <span className="font-bold text-slate-700">GPA Equivalent</span>
                       <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-black text-xs">{computeGpa()}</span>
                    </div>
                 </div>
               </div>

               {/* Notifications Mini List */}
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-orange-400">
                    <Bell className="w-4 h-4" /> Latest Alerts
                  </h3>
                  <div className="space-y-4">
                    {notifications.slice(0, 2).map(n => (
                      <div key={n.id} className={`p-4 rounded-2xl border ${n.is_read ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/20'}`}>
                         <p className="font-bold text-xs mb-1">{n.title}</p>
                         <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="text-[10px] text-slate-500 font-bold text-center">No alerts yet</p>}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-9">
              {/* Tabs */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-2 mb-8 inline-flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-4 rounded-3xl flex items-center gap-3 font-bold transition-all relative ${
                      activeTab === tab.id ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content Areas */}
              <div className="animate-in fade-in duration-500">
                {activeTab === "overview" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Academic Progress</h3>
                        <div className="space-y-6">
                           {(childData.grades?.semester_grades?.slice(0, 3) || []).map(grade => (
                             <div key={grade.id} className="flex items-center justify-between">
                                <div>
                                   <p className="font-bold text-slate-800">{grade.course_title}</p>
                                   <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-2">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${grade.total}%` }}></div>
                                   </div>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${getGradeColor(grade.grade)}`}>
                                   {grade.grade}
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Financial Overview</h3>
                        <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 mb-6">
                           <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Total Paid</p>
                           <p className="text-3xl font-black text-slate-900">{Number(childData.finance.balance?.total_paid || 0).toLocaleString()} KGS</p>
                        </div>
                        <div className="bg-rose-50 rounded-[2rem] p-6 border border-rose-100 mb-6">
                           <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Remaining Debt</p>
                           <p className="text-3xl font-black text-slate-900">{Number(childData.finance.balance?.balance || 0).toLocaleString()} KGS</p>
                        </div>
                        {childData.finance.invoices.some(inv => inv.status !== 'paid') ? (
                          <button
                            onClick={() => {
                              const first = childData.finance.invoices.find(inv => inv.status !== 'paid');
                              if (first) openPayModal(first);
                            }}
                            className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
                          >
                            <CreditCard className="w-5 h-5" /> Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab("finance")}
                            className="w-full py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-200"
                          >
                            <DollarSign className="w-5 h-5" /> View Invoices
                          </button>
                        )}
                     </div>
                   </div>
                )}

                {activeTab === "notifications" && (
                   <div className="space-y-4">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`bg-white rounded-3xl p-6 border transition-all flex gap-6 items-start ${
                            n.is_read ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-sm'
                          }`}
                          onClick={() => !n.is_read && markNotificationRead(n.id)}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                             n.notification_type === 'warning' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                           }`}>
                             {n.notification_type === 'warning' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between mb-2">
                                 <h4 className="font-black text-slate-900">{n.title}</h4>
                                 <span className="text-[10px] font-bold text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                           </div>
                           {!n.is_read && <div className="w-2 h-2 bg-rose-500 rounded-full mt-2"></div>}
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-20">
                           <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold">You're all caught up!</p>
                        </div>
                      )}
                   </div>
                )}

                {activeTab === "finance" && (
                   <div className="space-y-8">
                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                         <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
                            <CreditCard className="w-8 h-8 text-emerald-600" />
                            Active Invoices & Payments
                         </h3>
                         <div className="space-y-6">
                            {childData.finance.invoices.length === 0 ? (
                              <div className="text-center py-12 text-slate-400">
                                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-bold text-sm">No invoices found</p>
                              </div>
                            ) : childData.finance.invoices.map(invoice => (
                              <div key={invoice.id} className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                                 <div>
                                    <div className="flex items-center gap-3 mb-2">
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                         invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                         invoice.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                                         invoice.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                                         'bg-amber-100 text-amber-700'
                                       }`}>
                                          {invoice.status === 'partially_paid' ? 'Partial' : invoice.status}
                                       </span>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due: {invoice.due_date}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900">{invoice.title}</h4>
                                    <p className="text-slate-500 font-bold text-lg mt-1">{Number(invoice.amount).toLocaleString()} KGS</p>
                                    {invoice.status === 'partially_paid' && Number(invoice.total_paid) > 0 && (
                                      <p className="text-xs text-blue-600 font-bold mt-1">Paid: {Number(invoice.total_paid).toLocaleString()} KGS · Remaining: {(Number(invoice.amount) - Number(invoice.total_paid)).toLocaleString()} KGS</p>
                                    )}
                                 </div>
                                 <button
                                   onClick={() => openPayModal(invoice)}
                                   className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase transition-all shrink-0 bg-slate-900 text-white hover:bg-slate-700 cursor-pointer"
                                 >
                                   <CreditCard className="w-4 h-4" /> Pay
                                 </button>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                         <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                            <History className="w-6 h-6 text-slate-400" />
                            Recent Payment History
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {childData.finance.payments.map(p => (
                               <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                       p.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : p.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                                     }`}>
                                        {p.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                     </div>
                                     <div>
                                        <p className="font-black text-slate-900">{p.amount} KGS</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                                     </div>
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{p.status}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {activeTab === "grades" && (
                   <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-black text-slate-900 mb-8">Full Academic Transcript</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-100">
                              <th className="pb-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Course</th>
                              <th className="pb-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Module 1</th>
                              <th className="pb-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Module 2</th>
                              <th className="pb-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Exam</th>
                              <th className="pb-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {(childData.grades?.semester_grades || []).map(grade => (
                              <tr key={grade.id}>
                                <td className="py-6">
                                  <p className="font-bold text-slate-900">{grade.course_title}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{grade.course_code}</p>
                                </td>
                                <td className="py-6 text-center font-bold text-slate-600">{grade.attendance}</td>
                                <td className="py-6 text-center font-bold text-slate-600">{grade.activities}</td>
                                <td className="py-6 text-center font-bold text-slate-600">{grade.exam}</td>
                                <td className="py-6 text-center">
                                   <span className={`px-4 py-2 rounded-xl font-black text-sm inline-block ${getGradeColor(grade.grade)}`}>
                                      {grade.grade}
                                   </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                )}

                {activeTab === "attendance" && (
                   <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                      <h3 className="text-2xl font-black text-slate-900 mb-8">Monthly Attendance Record</h3>
                      <div className="grid gap-4">
                         {childData.attendance.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                               <div className="flex items-center gap-6">
                                  <div className={`w-3 h-3 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
                                  <div>
                                     <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.shcedule_course_title}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">{item.shcedule_day} • {item.shcedule_lesson_time}</p>
                                  </div>
                               </div>
                               <span className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest ${
                                 item.status ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                               }`}>
                                  {item.status ? 'Present' : 'Absent'}
                               </span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-slate-200">
             <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Baby className="w-16 h-16 text-orange-400" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-4">No Children Found</h2>
             <p className="text-slate-500 font-bold max-w-sm mx-auto uppercase text-xs tracking-widest leading-relaxed">Account not linked to any students. Please contact support.</p>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPayModal(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Submit Payment</h2>
              <button onClick={() => setPayModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-900">{payModal.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Total: <strong>{Number(payModal.amount).toLocaleString()} KGS</strong>
                  {Number(payModal.total_paid || 0) > 0 && (
                    <> · Remaining: <strong className="text-rose-600">{(Number(payModal.amount) - Number(payModal.total_paid)).toLocaleString()} KGS</strong></>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Payment Amount (KGS) *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Upload Receipt *</label>
                <label className="flex items-center gap-3 w-full px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    {payForm.receipt ? payForm.receipt.name : "Choose file (image or PDF)"}
                  </span>
                  <input type="file" className="hidden" accept="image/*,.pdf"
                    onChange={e => setPayForm(f => ({ ...f, receipt: e.target.files[0] || null }))} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPayModal(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-2xl hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={uploadLoading || !payForm.receipt || !payForm.amount || Number(payForm.amount) <= 0}
                  className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase rounded-2xl hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploadLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
