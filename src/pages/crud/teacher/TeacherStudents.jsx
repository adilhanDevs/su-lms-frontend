import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Search, ArrowLeft, Mail, Phone } from "lucide-react";
import api from "../../../api";

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allocRes = await api.get("api/teacher-allocations/");
        const allocations = allocRes.data || [];
        
        const groupIds = new Set();
        allocations.forEach(a => {
          if (a.group) groupIds.add(a.group);
        });

        let allStudents = [];
        for (const gid of groupIds) {
          try {
            const r = await api.get(`accounts/students/by-group/${gid}/`);
            allStudents = [...allStudents, ...(r.data || [])];
          } catch (e) {
            console.error(`Error fetching students for group ${gid}:`, e);
          }
        }
        
        // Remove duplicates if a student is in multiple fetched groups
        const uniqueStudents = Array.from(new Map(allStudents.map(item => [item.id, item])).values());
        setStudents(uniqueStudents);
      } catch (e) {
        console.error("Error fetching allocations:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.group?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" /> My Students
            </h1>
            <p className="text-gray-600">Students enrolled in your assigned groups</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, email, or group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Group</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                            {s.student?.first_name?.[0]}{s.student?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {s.student?.first_name} {s.student?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">ID: {s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                          {s.group?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {s.student?.email || "—"}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {s.student?.phone || "—"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;
