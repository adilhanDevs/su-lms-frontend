import React, { useState, useEffect } from "react";
import { UserCog, Plus, Trash2, CreditCard, BarChart3, X, CheckCircle, XCircle, Mail, Phone, Eye, EyeOff, Lock } from "lucide-react";
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

const ROLE_META = {
  accountant: { label: "Accountant", color: "bg-emerald-100 text-emerald-700", icon: <CreditCard className="w-3.5 h-3.5" /> },
  methodologist: { label: "Methodologist", color: "bg-indigo-100 text-indigo-700", icon: <BarChart3 className="w-3.5 h-3.5" /> },
};

export default function StaffCrud() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "accountant", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const loadStaff = async () => {
    try {
      const r = await api.get("accounts/staff/");
      setStaff(r.data);
    } catch {
      showToast("error", "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password) return showToast("error", "Fill required fields");
    if (form.password.length < 6) return showToast("error", "Password must be at least 6 characters");
    setSubmitting(true);
    try {
      await api.post("accounts/staff/", form);
      showToast("success", "Staff member created & credentials sent by email");
      setShowModal(false);
      setShowPassword(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", role: "accountant", password: "" });
      loadStaff();
    } catch (err) {
      showToast("error", err?.response?.data?.email?.[0] || "Failed to create staff");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`accounts/staff/${deleteTarget.id}/`);
      showToast("success", `${deleteTarget.first_name} removed`);
      setDeleteTarget(null);
      loadStaff();
    } catch {
      showToast("error", "Failed to delete");
    }
  };

  const counts = {
    accountant: staff.filter(s => s.role === "accountant").length,
    methodologist: staff.filter(s => s.role === "methodologist").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-400 mt-1">Accountants and Methodologists</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(ROLE_META).map(([key, meta]) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${key === "accountant" ? "bg-emerald-50" : "bg-indigo-50"}`}>
              {React.cloneElement(meta.icon, { className: `w-5 h-5 ${key === "accountant" ? "text-emerald-600" : "text-indigo-600"}` })}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{counts[key]}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}s</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 font-medium">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <UserCog className="w-10 h-10 text-slate-200" />
            <p className="text-slate-400 font-bold">No staff members yet</p>
            <button onClick={() => setShowModal(true)} className="text-sm text-blue-600 font-bold hover:underline">Add the first one</button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name", "Email", "Phone", "Role", "Joined", ""].map(h => (
                  <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map(s => {
                const meta = ROLE_META[s.role] || ROLE_META.accountant;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <span className="font-bold text-slate-900">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{s.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(s.date_joined).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">First Name *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+996 ..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["accountant", "methodologist"].map(r => (
                    <button type="button" key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.role === r ? (r === "accountant" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-indigo-500 bg-indigo-50 text-indigo-700") : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {ROLE_META[r].icon}
                      {ROLE_META[r].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-slate-700 disabled:opacity-50">
                  {submitting ? "Creating..." : "Create & Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-2">Remove Staff Member?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-bold text-slate-800">{deleteTarget.first_name} {deleteTarget.last_name}</span> will lose access to the system.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}
