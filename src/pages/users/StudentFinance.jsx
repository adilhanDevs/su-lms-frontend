import React, { useState, useEffect } from "react";
import { Receipt, CreditCard, CheckCircle, XCircle, Clock, Loader2, Info } from "lucide-react";
import api from "../../api";

const STATUS_META = {
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
  partially_paid: { label: "Partially Paid", cls: "bg-yellow-100 text-yellow-700" },
  overdue: { label: "Overdue", cls: "bg-rose-100 text-rose-700" },
  pending: { label: "Pending", cls: "bg-slate-100 text-slate-600" },
};

const PAYMENT_STATUS_META = {
  pending: { label: "Under Review", cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-700", icon: <XCircle className="w-3 h-3" /> },
};

const StudentFinance = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("invoices");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [inv, pay, bal] = await Promise.all([
          api.get("finance/my/invoices/"),
          api.get("finance/my/payments/"),
          api.get("finance/my/balance/"),
        ]);
        setInvoices(inv.data || []);
        setPayments(pay.data || []);
        setBalance(bal.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-indigo-600" /> My Finances
        </h1>
        <p className="text-slate-500 text-sm mt-1">View your invoices and payment history</p>
      </div>

      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">Payments are managed by your parent. Contact the finance office for assistance.</p>
      </div>

      {balance && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Charged</p>
            <p className="text-2xl font-black text-slate-900">{Number(balance.total_charged || 0).toLocaleString()} сом</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Paid</p>
            <p className="text-2xl font-black text-emerald-600">{Number(balance.total_paid || 0).toLocaleString()} сом</p>
          </div>
          <div className={`border rounded-2xl p-5 shadow-sm ${Number(balance.balance) > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Remaining Balance</p>
            <p className={`text-2xl font-black ${Number(balance.balance) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {Number(balance.balance || 0).toLocaleString()} сом
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {[["invoices", "Invoices"], ["payments", "Payment History"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === id ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : tab === "invoices" ? (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No invoices yet</p>
            </div>
          ) : invoices.map(inv => {
            const meta = STATUS_META[inv.status] || STATUS_META.pending;
            const remaining = Number(inv.amount) - Number(inv.total_paid || 0);
            return (
              <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-bold text-slate-900">{inv.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${meta.cls}`}>{meta.label}</span>
                </div>
                <div className="flex gap-6 text-sm text-slate-500">
                  <span>Total: <strong className="text-slate-800">{Number(inv.amount).toLocaleString()} сом</strong></span>
                  <span>Paid: <strong className="text-emerald-600">{Number(inv.total_paid || 0).toLocaleString()} сом</strong></span>
                  {remaining > 0 && <span>Due: <strong className="text-rose-600">{remaining.toLocaleString()} сом</strong></span>}
                  <span>Due date: <strong>{new Date(inv.due_date).toLocaleDateString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No payment history</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  {["Invoice", "Amount", "Method", "Receipt", "Status", "Date"].map(h => (
                    <th key={h} className="px-6 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => {
                  const meta = PAYMENT_STATUS_META[p.status] || PAYMENT_STATUS_META.pending;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{p.invoice_title}</td>
                      <td className="px-6 py-4">{Number(p.amount).toLocaleString()} сом</td>
                      <td className="px-6 py-4 capitalize text-slate-600">{p.payment_method}</td>
                      <td className="px-6 py-4">
                        {p.receipt ? (
                          <a href={p.receipt} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs font-bold">View</a>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.cls}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentFinance;
