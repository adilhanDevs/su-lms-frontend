import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Trash2, Edit, Mail, Phone, X, Shield, Loader2 } from "lucide-react";
import api from "../../api";

const AdminParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [modalMode, setModalMode] = useState(null); // "create" | "edit" | "delete"
  const [selectedParent, setSelectedParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    student: "",
  });

  const fetchParents = async () => {
    try {
      const res = await api.get("accounts/parents/");
      setParents(res.data || []);
    } catch (e) {
      console.error("parents error", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("accounts/students/");
      setStudents(res.data || []);
    } catch (e) {
      console.error("students error", e);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setSelectedParent(null);
    setFormData({ first_name: "", last_name: "", phone: "", email: "", password: "", student: "" });
    setError(""); setMessage("");
    setModalMode("create");
  };

  const openEdit = (p) => {
    setSelectedParent(p);
    setFormData({
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone || "",
      email: p.user?.email || "",
      password: "",
      student: p.student?.id || "",
    });
    setError(""); setMessage("");
    setModalMode("edit");
  };

  const openDelete = (p) => { setSelectedParent(p); setModalMode("delete"); };
  const closeModal = () => { setModalMode(null); setSelectedParent(null); };

  const handleDelete = async () => {
    try {
      await api.delete(`accounts/parents/${selectedParent.id}/`);
      closeModal();
      fetchParents();
    } catch {
      setError("Failed to delete parent.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (modalMode === "create") {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          student: formData.student ? parseInt(formData.student) : null,
        };
        if (formData.password) payload.user = { password: formData.password };
        await api.post("accounts/parents/create/", payload);
        setMessage("Parent created successfully!");
        fetchParents();
        setTimeout(() => closeModal(), 1500);
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
        };
        await api.patch(`accounts/parents/update/${selectedParent.id}/`, payload);
        setMessage("Parent updated successfully!");
        fetchParents();
        setTimeout(() => closeModal(), 1500);
      }
    } catch (err) {
      setError("Failed. " + (err.response?.data?.details || err.response?.data?.error || ""));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = parents.filter((p) =>
    p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student?.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student?.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Parents
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage parent accounts and student associations</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add Parent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parents or their students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No parents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Student (Child)</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredParents.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {p.first_name?.[0]}{p.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{p.first_name} {p.last_name}</p>
                          <p className="text-xs text-slate-500">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          {p.user?.email || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3.5 h-3.5" />
                          {p.phone || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.student ? (
                        <div>
                          <p className="font-medium text-slate-900">
                            {p.student.student?.first_name} {p.student.student?.last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Group: {p.student.group?.name || "—"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No student associated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(p)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {modalMode === "delete" && selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-2">Remove Parent?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-bold text-slate-800">{selectedParent.first_name} {selectedParent.last_name}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Parent Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{modalMode === "create" ? "Add New Parent" : "Edit Parent"}</h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Student</label>
                <select name="student" value={formData.student} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.student?.first_name + ' ' + s.student?.last_name} ({s.group?.name || 'No group'})
                    </option>
                  ))}
                </select>
              </div>

              {modalMode === "create" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password (Optional)
                    </span>
                  </label>
                  <input type="text" name="password" value={formData.password} onChange={handleChange}
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : modalMode === "create" ? "Create Parent" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParents;
