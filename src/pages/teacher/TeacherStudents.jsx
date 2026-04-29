import React, { useEffect, useState } from "react";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Users, Mail } from "lucide-react";

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const allocsRes = await api.get("api/teacher-allocations/");
        const allocations = allocsRes.data || [];
        const groupIds = [...new Set(allocations.map((a) => a.group).filter(Boolean))];

        const lists = await Promise.all(
          groupIds.map((gid) =>
            api
              .get(`accounts/students/by-group/${gid}/`)
              .then((r) =>
                (r.data || []).map((s) => ({ ...s, group_id: gid }))
              )
              .catch(() => [])
          )
        );
        const seen = new Set();
        const flat = [];
        lists.flat().forEach((s) => {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            flat.push(s);
          }
        });
        setStudents(flat);
      } catch (e) {
        console.error(e);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell title="My Students" subtitle="Students enrolled in your groups">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-rose-500">{error}</p>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No students assigned.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name", "Email", "Group"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 text-sm">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {s.student?.first_name} {s.student?.last_name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {s.student?.email || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Group #{s.group_id ?? s.group}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
