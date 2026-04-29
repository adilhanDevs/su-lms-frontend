import React, { useState, useEffect, useRef } from "react";
import { FileText, Plus, X, CheckCircle, XCircle, Clock, Loader2, Printer, Download } from "lucide-react";
import api from "../../api";

const DOC_TYPES = [
  { value: "certificate", label: "Certificate of Enrollment" },
  { value: "transcript", label: "Academic Transcript" },
  { value: "reference", label: "Reference Letter" },
  { value: "military", label: "Military Reference" },
  { value: "other", label: "Other" },
];

const STATUS_META = {
  pending: { label: "Under Review", cls: "bg-amber-100 text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
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

const StudentDocuments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ document_type: "certificate", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const printRef = useRef(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("documents/my/");
      setRequests(res.data || []);
    } catch {
      showToast("error", "Failed to load document requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("documents/my/", form);
      showToast("success", "Document request submitted");
      setShowModal(false);
      setForm({ document_type: "certificate", description: "" });
      load();
    } catch {
      showToast("error", "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (doc) => {
    const docType = DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docType}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .subtitle { font-size: 14px; color: #666; }
          .content { margin: 30px 0; line-height: 1.8; }
          .label { font-weight: bold; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; }
          .signature-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; }
          .stamp { width: 120px; height: 120px; border: 2px solid #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: bold; color: #333; }
          @media print { body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SkyLearn University</div>
          <div class="subtitle">${docType}</div>
        </div>
        <div class="content">
          <p><span class="label">Student:</span> ${doc.student_name}</p>
          <p><span class="label">Document Type:</span> ${docType}</p>
          <p><span class="label">Issue Date:</span> ${new Date().toLocaleDateString()}</p>
          ${doc.methodologist_note ? `<p><span class="label">Note:</span> ${doc.methodologist_note}</p>` : ""}
          <br/>
          <p>This document confirms that the student named above is currently enrolled at SkyLearn University and has fulfilled the necessary academic requirements as of the date of issuance.</p>
        </div>
        <div class="footer">
          <div>
            <div class="signature-line">Methodologist</div>
          </div>
          <div class="stamp">OFFICIAL<br/>SEAL</div>
          <div>
            <div class="signature-line">Director</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> My Documents
          </h1>
          <p className="text-slate-500 text-sm mt-1">Request official documents and certificates</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Request Document
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <FileText className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-400 mb-2">No document requests yet</p>
          <p className="text-sm text-slate-400">Click "Request Document" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(doc => {
            const meta = STATUS_META[doc.status] || STATUS_META.pending;
            const docLabel = DOC_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type;
            return (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{docLabel}</h3>
                        <p className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-slate-600 mt-2 ml-13 pl-0">{doc.description}</p>
                    )}
                    {doc.methodologist_note && (
                      <div className={`mt-3 p-3 rounded-xl text-sm ${doc.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        <span className="font-bold">Methodologist note: </span>{doc.methodologist_note}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${meta.cls}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {doc.status === "approved" && (
                      <div className="flex gap-2">
                        {doc.approved_file && (
                          <a href={doc.approved_file} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        )}
                        <button onClick={() => handlePrint(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Request a Document</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Document Type *</label>
                <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Additional Details</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe the purpose or any specific requirements..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
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

export default StudentDocuments;
