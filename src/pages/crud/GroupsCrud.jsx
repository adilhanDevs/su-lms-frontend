import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Users,
  ChevronRight,
  X,
  AlertCircle,
  Layers,
  GraduationCap
} from "lucide-react";

// Modal component
function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function GroupsCrud() {
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    program: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts/groups/");
      setGroups(res.data || []);
    } catch (e) {
      console.error("Error fetching groups:", e);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await api.get("/api/programs/");
      setPrograms(res.data || []);
    } catch (e) {
      console.error("Error fetching programs:", e);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchPrograms();
  }, [fetchGroups, fetchPrograms]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        program: parseInt(form.program),
      };
      const res = await api.post("/accounts/groups/create/", payload);
      setGroups([...groups, res.data]);
      setIsCreateOpen(false);
      setForm({ name: "", program: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        program: parseInt(form.program),
      };
      const res = await api.patch(`/accounts/groups/${editingId}/update/`, payload);
      setGroups(groups.map((g) => (g.id === editingId ? res.data : g)));
      setIsEditOpen(false);
      setForm({ name: "", program: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Error updating group");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await api.delete(`/accounts/groups/${id}/delete/`);
      setGroups(groups.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting group");
    }
  };

  const openEdit = (group) => {
    setForm({
      name: group.name,
      program: group.program?.id || group.program,
    });
    setEditingId(group.id);
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Link to="/admin/create-students" className="text-blue-600 hover:underline flex items-center gap-1">
                 <ChevronRight className="w-4 h-4 rotate-180" />
                 Back to Students
               </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Groups Management</h1>
            <p className="text-gray-600">Create and manage student groups and their programs</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchGroups}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Group
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
            <p className="text-gray-600 mb-6">Start by creating your first student group</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Group Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Students Count</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{group.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {group.program?.name || group.program || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {group.students_count || 0} students
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(group)}
                            className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-yellow-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(group.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          open={isCreateOpen}
          title="Create New Group"
          onClose={() => setIsCreateOpen(false)}
        >
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. CS-2024-A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
              >
                Create Group
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          open={isEditOpen}
          title="Edit Group"
          onClose={() => setIsEditOpen(false)}
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 shadow-lg shadow-yellow-500/25 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default GroupsCrud;
