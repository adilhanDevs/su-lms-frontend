import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Search, Upload, Loader2, X } from "lucide-react";
import api from "../../../api";

const DOC_TYPE_LABELS = {
  certificate: "Certificate of Enrollment",
  transcript: "Academic Transcript",
  reference: "Reference Letter",
  military: "Military Reference",
  other: "Other",
};

const STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-700", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${msg.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {msg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {msg.text}
    </div>
  );
}

const MethodologistDocuments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [reviewModal, setReviewModal] = useState(null); // document request object
  const [reviewForm, setReviewForm] = useState({ status: "approved", methodologist_note: "", approved_file: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await api.get("documents/all/", { params });
      setRequests(res.data || []);
    } catch {
      showToast("error", "Failed to load document requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const openReview = (doc) => {
    setReviewForm({ status: "approved", methodologist_note: "", approved_file: null });
    setReviewModal(doc);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("status", reviewForm.status);
      fd.append("methodologist_note", reviewForm.methodologist_note);
      if (reviewForm.approved_file) fd.append("approved_file", reviewForm.approved_file);
      await api.patch(`documents/${reviewModal.id}/review/`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToast("success", `Request ${reviewForm.status}`);
      setReviewModal(null);
      load();
    } catch {
      showToast("error", "Failed to review request");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter(r =>
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    DOC_TYPE_LABELS[r.document_type]?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" /> Document Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review and approve student document requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { key: "pending", label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
            { key: "approved", label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50" },
            { key: "rejected", label: "Rejected", color: "text-rose-600", bg: "bg-rose-50" },
          ].map(s => (
            <div key={s.key} className={`${s.bg} border border-slate-200 rounded-2xl p-5`}>
              <p className={`text-2xl font-black ${s.color}`}>{counts[s.key]}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
            {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"]].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by student or type..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-medium text-slate-400">No requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(doc => {
              const meta = STATUS_META[doc.status] || STATUS_META.pending;
              const typeLabel = DOC_TYPE_LABELS[doc.document_type] || doc.document_type;
              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-900">{doc.student_name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${meta.cls}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{typeLabel}</p>
                    {doc.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.description}</p>}
                    {doc.methodologist_note && (
                      <p className="text-xs text-slate-500 italic mt-1">Note: {doc.methodologist_note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                    {doc.status === "pending" && (
                      <button onClick={() => openReview(doc)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                        Review
                      </button>
                    )}
                    {doc.status !== "pending" && (
                      <button onClick={() => openReview(doc)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                        Update
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Review Request</h2>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReview} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{reviewModal.student_name}</p>
                <p className="text-sm text-slate-600">{DOC_TYPE_LABELS[reviewModal.document_type]}</p>
                {reviewModal.description && <p className="text-xs text-slate-500 mt-1">{reviewModal.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Decision *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setReviewForm(f => ({ ...f, status: "approved" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${reviewForm.status === "approved" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button type="button" onClick={() => setReviewForm(f => ({ ...f, status: "rejected" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${reviewForm.status === "rejected" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Note to Student</label>
                <textarea value={reviewForm.methodologist_note} onChange={e => setReviewForm(f => ({ ...f, methodologist_note: e.target.value }))}
                  rows={3} placeholder="Optional message for the student..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
              </div>

              {reviewForm.status === "approved" && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Attach Document (optional)</label>
                  <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {reviewForm.approved_file ? reviewForm.approved_file.name : "Upload signed/stamped document (PDF or image)"}
                    </span>
                    <input type="file" className="hidden" accept="image/*,.pdf"
                      onChange={e => setReviewForm(f => ({ ...f, approved_file: e.target.files[0] || null }))} />
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setReviewModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className={`flex-1 py-2.5 text-white text-xs font-black uppercase rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 ${reviewForm.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {reviewForm.status === "approved" ? "Approve" : "Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default MethodologistDocuments;
