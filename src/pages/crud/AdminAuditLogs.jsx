import React, { useState } from "react";
import { Search, ShieldAlert, ArrowDownUp } from "lucide-react";

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Static mock data for now, since there is no backend API for audit logs
  const [logs] = useState([
    { id: 101, action: "User Login", user: "admin@admin.com", ip: "192.168.1.1", time: "2026-04-28 10:45:12", status: "Success" },
    { id: 102, action: "Created Course", user: "admin@admin.com", ip: "192.168.1.1", time: "2026-04-28 10:50:03", status: "Success" },
    { id: 103, action: "Failed Login", user: "unknown", ip: "10.0.0.42", time: "2026-04-28 11:15:22", status: "Failed" },
    { id: 104, action: "Deleted Contract", user: "admin@admin.com", ip: "192.168.1.1", time: "2026-04-28 11:20:05", status: "Success" },
    { id: 105, action: "Generated Invoices", user: "accountant@accountant.com", ip: "192.168.1.5", time: "2026-04-28 11:30:45", status: "Success" },
  ]);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            System Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track system activity, logins, and administrative actions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by user or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50">
            <ArrowDownUp className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">#{l.id}</td>
                  <td className="px-6 py-4 text-slate-500">{l.time}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{l.user}</td>
                  <td className="px-6 py-4">{l.action}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{l.ip}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${l.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No logs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
