import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Search, X, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

const EMPTY_FORM = { name: "", tuition_fee: "" };

const MethodologistPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "create" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/programs/");
      setPrograms(res.data || []);
    } catch {
      showToast("error", "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModal("create"); };
  const openEdit = (p) => { setSelected(p); setForm({ name: p.name, tuition_fee: p.tuition_fee || "" }); setModal("edit"); };
  const openDelete = (p) => { setSelected(p); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "Program name is required");
    setSubmitting(true);
    try {
      if (modal === "create") {
        await api.post("/api/programs/create/", form);
        showToast("success", "Program created");
      } else {
        await api.patch(`/api/programs/${selected.id}/update/`, form);
        showToast("success", "Program updated");
      }
      closeModal();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.name?.[0] || "Failed to save program");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/programs/${selected.id}/`);
      showToast("success", "Program deleted");
      closeModal();
      load();
    } catch {
      showToast("error", "Failed to delete — program may have linked groups");
    }
  };

  const filtered = programs.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" /> Study Programs
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Manage educational programs and curricula</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search programs..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64 transition-all" />
            </div>
            <button onClick={openCreate}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors font-bold text-sm">
              <Plus className="w-4 h-4" /> Add Program
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No programs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDelete(p)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-auto">{p.name}</h3>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">ID: {p.id}</span>
                  {p.tuition_fee && Number(p.tuition_fee) > 0 ? (
                    <span className="text-sm font-bold text-indigo-600">{Number(p.tuition_fee).toLocaleString()} сом/sem</span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No fee set</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{modal === "create" ? "Add Program" : "Edit Program"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Program Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Tuition Fee (сом/semester)</label>
                <input type="number" value={form.tuition_fee} onChange={e => setForm(f => ({ ...f, tuition_fee: e.target.value }))}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
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
            <h3 className="text-lg font-black text-slate-900 mb-2">Delete Program?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-bold text-slate-800">{selected.name}</span> and all linked data will be removed.
            </p>
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

export default MethodologistPrograms;
