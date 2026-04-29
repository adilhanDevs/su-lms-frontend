import React, { useState, useEffect } from "react";
import { FileText, Search, Plus, Edit, Trash2, X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../../../api";

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${msg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {msg.text}
    </div>
  );
}

const EMPTY_FORM = { student: "", contract_number: "", title: "Educational Services Contract", amount: "", start_date: "", end_date: "", is_active: true };

const AccountantContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    try {
      const [cr, st, pr] = await Promise.all([
        api.get("finance/contracts/"),
        api.get("accounts/students/"),
        api.get("/api/programs/"),
      ]);
      setContracts(cr.data || []);
      setStudents(st.data || []);
      setPrograms(pr.data || []);
    } catch { showToast("error", "Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const getProgramFee = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (!student?.group?.program?.id) return "";
    const prog = programs.find(p => p.id === student.group.program.id);
    return prog?.tuition_fee ? String(prog.tuition_fee) : "";
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const openEdit = (c) => {
    setSelected(c);
    setForm({ student: c.student, contract_number: c.contract_number, title: c.title, amount: c.amount, start_date: c.start_date, end_date: c.end_date, is_active: c.is_active });
    setModal("edit");
  };

  const openDelete = (c) => { setSelected(c); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleStudentChange = (studentId) => {
    const fee = getProgramFee(studentId);
    setForm(f => ({ ...f, student: studentId, amount: fee || f.amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.contract_number || !form.amount || !form.start_date || !form.end_date)
      return showToast("error", "Fill all required fields");
    setSubmitting(true);
    try {
      if (modal === "create") {
        await api.post("finance/contracts/", form);
        showToast("success", "Contract created");
      } else {
        await api.patch(`finance/contracts/${selected.id}/`, form);
        showToast("success", "Contract updated");
      }
      closeModal();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.contract_number?.[0] || "Failed to save contract");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`finance/contracts/${selected.id}/`);
      showToast("success", "Contract deleted");
      closeModal();
      load();
    } catch { showToast("error", "Failed to delete"); }
  };

  const filtered = contracts.filter(c =>
    c.contract_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.student_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Student Contracts
        </h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Contract
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by number or student..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p>No contracts found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                {["Contract No.", "Student", "Amount", "Period", "Status", ""].map(h => (
                  <th key={h} className="px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{c.contract_number}</td>
                  <td className="px-5 py-3 text-slate-700">{c.student_name || c.student}</td>
                  <td className="px-5 py-3 font-medium">{Number(c.amount).toLocaleString()} сом</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openDelete(c)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{modal === "create" ? "New Contract" : "Edit Contract"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Student *</label>
                <select value={form.student} onChange={e => handleStudentChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || `${s.student?.first_name} ${s.student?.last_name}`} ({s.group?.name || "No group"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Contract No. *</label>
                  <input value={form.contract_number} onChange={e => setForm(f => ({ ...f, contract_number: e.target.value }))}
                    placeholder="e.g. CTR-2024-001"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Amount (сом) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="Auto-fills from program fee"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Start Date *</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">End Date *</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm font-medium text-slate-700">Active contract</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Delete Contract?</h3>
            <p className="text-sm text-slate-500 mb-6">Contract <span className="font-bold text-slate-800">{selected.contract_number}</span> will be permanently deleted.</p>
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

export default AccountantContracts;
