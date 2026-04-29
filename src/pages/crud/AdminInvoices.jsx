import React, { useState, useEffect } from "react";
import { Receipt, Search, Plus, Trash2, Edit, X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../../api";

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${msg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {msg.text}
    </div>
  );
}

const STATUS_COLORS = {
  paid: "bg-emerald-100 text-emerald-700",
  partially_paid: "bg-yellow-100 text-yellow-700",
  overdue: "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-600",
};

const EMPTY_FORM = { student: "", title: "Tuition Fee", amount: "", status: "pending", due_date: "" };

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null); // "create" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    try {
      const [inv, st] = await Promise.all([api.get("finance/invoices/"), api.get("accounts/students/")]);
      setInvoices(inv.data || []);
      setStudents(st.data || []);
    } catch { showToast("error", "Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModal("create"); };
  const openEdit = (inv) => {
    setSelected(inv);
    setForm({ student: inv.student, title: inv.title, amount: inv.amount, status: inv.status, due_date: inv.due_date });
    setModal("edit");
  };
  const openDelete = (inv) => { setSelected(inv); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.title || !form.amount || !form.due_date)
      return showToast("error", "Fill all required fields");
    setSubmitting(true);
    try {
      if (modal === "create") {
        await api.post("finance/invoices/create/", form);
        showToast("success", "Invoice created");
      } else {
        await api.patch(`finance/invoices/${selected.id}/update/`, form);
        showToast("success", "Invoice updated");
      }
      closeModal();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.detail || "Failed to save invoice");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`finance/invoices/${selected.id}/delete/`);
      showToast("success", "Invoice deleted");
      closeModal();
      load();
    } catch { showToast("error", "Failed to delete"); }
  };

  const filtered = invoices.filter(i =>
    i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" /> Invoices
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage all student invoices and payments</p>
        </div>
        <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by title or student..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-medium">No invoices found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                {["Title", "Student", "Amount", "Paid", "Due Date", "Status", ""].map(h => (
                  <th key={h} className="px-6 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{i.title}</td>
                  <td className="px-6 py-4 text-slate-700">{i.student_name || i.student}</td>
                  <td className="px-6 py-4 font-medium">{Number(i.amount).toLocaleString()} сом</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{Number(i.total_paid || 0).toLocaleString()} сом</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(i.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${STATUS_COLORS[i.status] || STATUS_COLORS.pending}`}>
                      {i.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(i)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => openDelete(i)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{modal === "create" ? "Create Invoice" : "Edit Invoice"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Student *</label>
                <select value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || `${s.student?.first_name} ${s.student?.last_name}`} ({s.group?.name || "No group"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Amount (сом) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Due Date *</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-2">Delete Invoice?</h3>
            <p className="text-sm text-slate-500 mb-6">Invoice <span className="font-bold text-slate-800">"{selected.title}"</span> for {selected.student_name} will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default AdminInvoices;
