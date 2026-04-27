import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, Check, X, Send, Upload, ChevronRight, CreditCard, LogOut, Users, Layers, AlertCircle, Plus, Bell } from "lucide-react";
import api from "../../api";

/* ── small helpers ── */
const badge = (color, text) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${color}`}>{text}</span>
);

const statusBadge = (s) => {
  const map = { paid: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", overdue: "bg-rose-100 text-rose-700", partially_paid: "bg-blue-100 text-blue-700" };
  return badge(map[s] || "bg-slate-100 text-slate-600", s);
};

/* ── Modal ── */
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${msg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {msg.text}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function AccountantDashboard() {
  const [tab, setTab] = useState("programs"); // programs | verify
  const [programs, setPrograms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]); // [{label, action}]
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modal, setModal] = useState(null); // "invoice" | "notify" | "receipt"
  const [invoiceForm, setInvoiceForm] = useState({ title: "Tuition Fee", amount: "", due_date: "" });
  const [notifyForm, setNotifyForm] = useState({ message: "" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  /* fetchers */
  const loadPrograms = async () => {
    try { const r = await api.get("finance/accountant/programs/"); setPrograms(r.data); } catch { showToast("error", "Failed to load programs"); }
  };
  const loadGroups = async (prog) => {
    try { const r = await api.get(`finance/accountant/programs/${prog.id}/groups/`); setGroups(r.data); setBreadcrumb([{ label: prog.name }]); setStudents([]); setSelectedGroup(null); } catch { showToast("error", "Failed to load groups"); }
  };
  const loadStudents = async (group) => {
    setSelectedGroup(group);
    try { const r = await api.get(`finance/accountant/groups/${group.id}/students/`); setStudents(r.data); setBreadcrumb(prev => prev.slice(0, 1).concat([{ label: group.name }])); } catch { showToast("error", "Failed to load students"); }
  };
  const loadPending = async () => {
    try { const r = await api.get("finance/accountant/payments/pending/"); setPending(r.data); } catch { showToast("error", "Failed to load pending payments"); }
  };

  useEffect(() => { loadPrograms(); loadPending(); }, []);

  /* actions */
  const createInvoices = async () => {
    if (!invoiceForm.amount || !invoiceForm.due_date) return showToast("error", "Fill amount and deadline");
    setLoading(true);
    try {
      const r = await api.post(`finance/accountant/groups/${selectedGroup.id}/create-invoices/`, invoiceForm);
      showToast("success", `${r.data.invoices_created} invoice(s) sent!`);
      setModal(null);
      loadStudents(selectedGroup);
    } catch { showToast("error", "Failed to create invoices"); }
    setLoading(false);
  };

  const verifyPayment = async (id, status) => {
    try {
      await api.post(`finance/accountant/payments/${id}/verify/`, { status });
      showToast("success", `Payment ${status}!`);
      loadPending();
    } catch { showToast("error", "Failed"); }
  };

  const sendDebtNotif = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      await api.post("finance/accountant/notifications/send-debt/", {
        student_id: selectedStudent.student_id,
        amount: selectedStudent.debt,
        deadline: notifyForm.deadline || "ASAP",
        message: notifyForm.message || `You have an outstanding debt of ${selectedStudent.debt}. Please pay as soon as possible.`
      });
      showToast("success", "Notification sent to student & parents!");
      setModal(null);
    } catch { showToast("error", "Failed to send"); }
    setLoading(false);
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f172a] text-slate-300 flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-xs uppercase tracking-widest">Finance</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {[
            { id: "programs", icon: <Layers className="w-4 h-4" />, label: "Programs" },
            { id: "verify", icon: <Clock className="w-4 h-4" />, label: "Verify Payments", badge: pending.length },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold uppercase transition-all relative ${tab === item.id ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "hover:bg-slate-800/50"}`}>
              {item.icon} {item.label}
              {item.badge > 0 && <span className="absolute right-3 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <a href="/logout" className="flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-bold uppercase">
            <LogOut className="w-4 h-4" /> Logout
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-8 gap-3 sticky top-0 z-40">
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Accountant</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{tab === "programs" ? "Programs" : "Verify Payments"}</span>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-black text-slate-500">{b.label}</span>
            </React.Fragment>
          ))}
        </header>

        <div className="p-8">
          {/* ── Programs tab ── */}
          {tab === "programs" && (
            <div>
              {/* Programs list */}
              {groups.length === 0 && students.length === 0 && (
                <>
                  <h1 className="text-2xl font-black text-slate-900 mb-6">Select Program</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map(prog => (
                      <button key={prog.id} onClick={() => loadGroups(prog)}
                        className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-left group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-emerald-600" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <h3 className="font-black text-slate-900 mb-1">{prog.name}</h3>
                        <p className="text-xs text-slate-400 font-bold mb-3">{prog.group_count} groups · {prog.student_count} students</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-emerald-600 font-black">Paid: {prog.total_paid}</span>
                          <span className="text-rose-500 font-black">Debt: {prog.total_debt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Groups list */}
              {groups.length > 0 && students.length === 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <button onClick={() => { setGroups([]); setBreadcrumb([]); }} className="text-xs font-black text-emerald-600 hover:underline mb-1">← Back to Programs</button>
                      <h1 className="text-2xl font-black text-slate-900">Groups in {breadcrumb[0]?.label}</h1>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {["Group", "Students", "Charged", "Paid", "Debt", "Pending Payments", ""].map(h => (
                            <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groups.map(g => (
                          <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{g.name}</td>
                            <td className="px-6 py-4 text-slate-600">{g.student_count}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{g.total_charged}</td>
                            <td className="px-6 py-4 font-bold text-emerald-600">{g.total_paid}</td>
                            <td className="px-6 py-4 font-black text-rose-500">{g.total_debt > 0 ? g.total_debt : "—"}</td>
                            <td className="px-6 py-4">{g.pending_payments > 0 && badge("bg-amber-100 text-amber-700", `${g.pending_payments} pending`)}</td>
                            <td className="px-6 py-4">
                              <button onClick={() => loadStudents(g)} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-black rounded-lg hover:bg-slate-700 transition-colors">
                                View Students
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Students list */}
              {students.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <button onClick={() => { setStudents([]); setSelectedGroup(null); setBreadcrumb(prev => prev.slice(0, 1)); }} className="text-xs font-black text-emerald-600 hover:underline mb-1">← Back to Groups</button>
                      <h1 className="text-2xl font-black text-slate-900">Students in {selectedGroup?.name}</h1>
                    </div>
                    <button onClick={() => setModal("invoice")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                      <Plus className="w-4 h-4" /> Create Invoice for Group
                    </button>
                  </div>

                  <div className="space-y-4">
                    {students.map(s => (
                      <div key={s.student_id} className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-black text-slate-900">{s.student_name}</h3>
                            <div className="flex gap-4 mt-1 text-xs font-bold">
                              <span className="text-slate-400">Charged: <span className="text-slate-700">{s.total_charged}</span></span>
                              <span className="text-slate-400">Paid: <span className="text-emerald-600">{s.total_paid}</span></span>
                              <span className="text-slate-400">Debt: <span className={s.debt > 0 ? "text-rose-500" : "text-emerald-500"}>{s.debt > 0 ? s.debt : "None"}</span></span>
                              {s.pending_payments > 0 && badge("bg-amber-100 text-amber-700", `${s.pending_payments} pending`)}
                            </div>
                          </div>
                          <button onClick={() => { setSelectedStudent(s); setModal("notify"); }}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-black uppercase rounded-xl hover:bg-rose-100 transition-colors">
                            <Bell className="w-3.5 h-3.5" /> Notify
                          </button>
                        </div>

                        {s.invoices.length > 0 && (
                          <div className="mt-2 border-t border-slate-100 pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Invoices</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {s.invoices.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{inv.title}</p>
                                    <p className="text-[10px] text-slate-400">Due: {inv.due_date} · {inv.amount} KGS</p>
                                  </div>
                                  {statusBadge(inv.status)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Verify tab ── */}
          {tab === "verify" && (
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-6">Pending Payments ({pending.length})</h1>
              {pending.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                  <p className="font-bold text-slate-400">All clear! No pending payments.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 rounded-xl"><Clock className="w-6 h-6 text-amber-500" /></div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">{p.amount}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{p.payment_method}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.student_name}</p>
                        <p className="text-xs text-slate-400">{p.invoice_title}</p>
                        {p.comment && <p className="text-xs text-slate-500 italic mt-1">"{p.comment}"</p>}
                      </div>
                      {p.receipt && (
                        <a href={p.receipt} target="_blank" rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View Receipt
                        </a>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => verifyPayment(p.id, "approved")}
                          className="flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-colors">
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => verifyPayment(p.id, "rejected")}
                          className="flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 text-xs font-black rounded-xl hover:bg-rose-100 transition-colors">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Invoice Modal */}
      <Modal open={modal === "invoice"} title={`Create Invoice — ${selectedGroup?.name}`} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Invoice Title</label>
            <input value={invoiceForm.title} onChange={e => setInvoiceForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Amount (KGS)</label>
            <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="e.g. 50000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Payment Deadline</label>
            <input type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">This will create an invoice for <strong>all students</strong> in the group and notify them + their parents.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
            <button onClick={createInvoices} disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 disabled:opacity-50">
              {loading ? "Sending..." : "Create & Notify"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notify Student Modal */}
      <Modal open={modal === "notify"} title={`Notify — ${selectedStudent?.student_name}`} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <p className="text-xs font-bold text-rose-600">Current Debt: <span className="text-lg font-black">{selectedStudent?.debt} KGS</span></p>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Deadline</label>
            <input type="date" value={notifyForm.deadline || ""} onChange={e => setNotifyForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Message (optional)</label>
            <textarea value={notifyForm.message} onChange={e => setNotifyForm(f => ({ ...f, message: e.target.value }))}
              rows={3} placeholder="Custom message for student & parents..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
            <button onClick={sendDebtNotif} disabled={loading}
              className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </div>
      </Modal>

      <Toast msg={toast} />
    </div>
  );
}
