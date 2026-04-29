import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Edit, Trash2, Search, X, CheckCircle, XCircle,
  Loader2, User, Users, Calendar, ChevronDown, ChevronUp
} from "lucide-react";
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

const EMPTY_COURSE = { name: "", description: "" };
const EMPTY_ALLOC = { lecturer: "", courses: [], group: "", semester: "" };

const AccountantCourses = () => {
  const [courses, setCourses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("courses"); // "courses" | "allocations"
  const [modal, setModal] = useState(null); // "create-course" | "edit-course" | "delete-course" | "create-alloc" | "delete-alloc"
  const [selected, setSelected] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [allocForm, setAllocForm] = useState(EMPTY_ALLOC);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a, l, g, s] = await Promise.all([
        api.get("/api/courses/"),
        api.get("/api/course-allocations/"),
        api.get("/accounts/lecturers/"),
        api.get("/accounts/groups/"),
        api.get("/api/semesters/"),
      ]);
      setCourses(c.data || []);
      setAllocations(a.data || []);
      setLecturers(l.data || []);
      setGroups(g.data || []);
      setSemesters(s.data || []);
    } catch {
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModal(null); setSelected(null); };

  // Course CRUD
  const openCreateCourse = () => { setCourseForm(EMPTY_COURSE); setModal("create-course"); };
  const openEditCourse = (c) => { setSelected(c); setCourseForm({ name: c.name, description: c.description || "" }); setModal("edit-course"); };
  const openDeleteCourse = (c) => { setSelected(c); setModal("delete-course"); };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.name.trim()) return showToast("error", "Course name is required");
    setSubmitting(true);
    try {
      if (modal === "create-course") {
        await api.post("/api/courses/create/", courseForm);
        showToast("success", "Course created");
      } else {
        await api.patch(`/api/courses/${selected.id}/`, courseForm);
        showToast("success", "Course updated");
      }
      closeModal();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.name?.[0] || "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await api.delete(`/api/courses/${selected.id}/`);
      showToast("success", "Course deleted");
      closeModal();
      load();
    } catch {
      showToast("error", "Failed to delete — course may have linked allocations");
    }
  };

  // Allocation CRUD
  const openCreateAlloc = () => { setAllocForm(EMPTY_ALLOC); setModal("create-alloc"); };
  const openDeleteAlloc = (a) => { setSelected(a); setModal("delete-alloc"); };

  const handleAllocSubmit = async (e) => {
    e.preventDefault();
    if (!allocForm.lecturer || !allocForm.group || !allocForm.semester || allocForm.courses.length === 0)
      return showToast("error", "All fields are required");
    setSubmitting(true);
    try {
      await api.post("/api/course-allocations/create/", {
        lecturer: parseInt(allocForm.lecturer),
        courses: allocForm.courses.map(Number),
        group: parseInt(allocForm.group),
        semester: parseInt(allocForm.semester),
      });
      showToast("success", "Teacher assigned to course");
      closeModal();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.detail || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlloc = async () => {
    try {
      await api.delete(`/api/course-allocations/${selected.id}/`);
      showToast("success", "Assignment removed");
      closeModal();
      load();
    } catch {
      showToast("error", "Failed to remove assignment");
    }
  };

  const getLecturerName = (id) => {
    const l = lecturers.find(l => (l.lecturer_id || l.id) === id || l.lecturer?.id === id);
    if (!l) return `Lecturer #${id}`;
    return l.lecturer?.first_name
      ? `${l.lecturer.first_name} ${l.lecturer.last_name}`.trim()
      : l.lecturer?.username || `Lecturer #${id}`;
  };

  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAllocs = allocations.filter(a =>
    (a.lecturer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.group_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.courses_details || []).some(c => c.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" /> Courses & Teacher Assignments
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Manage courses and assign teachers to groups</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-56 transition-all" />
            </div>
            {tab === "courses" ? (
              <button onClick={openCreateCourse}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors font-bold text-sm">
                <Plus className="w-4 h-4" /> Add Course
              </button>
            ) : (
              <button onClick={openCreateAlloc}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors font-bold text-sm">
                <Plus className="w-4 h-4" /> Assign Teacher
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 p-1 rounded-xl w-fit shadow-sm">
          {[["courses", <BookOpen className="w-4 h-4" />, "Courses"], ["allocations", <User className="w-4 h-4" />, "Teacher Assignments"]].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${tab === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : tab === "courses" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No courses found</p>
              </div>
            ) : filteredCourses.map(c => {
              const teachers = c.allocated_teachers || [];
              const isExpanded = expandedCourse === c.id;
              return (
                <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditCourse(c)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteCourse(c)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{c.name}</h3>
                  {c.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>}

                  {/* Teachers */}
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    {teachers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No teacher assigned</p>
                    ) : (
                      <div>
                        <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                          onClick={() => setExpandedCourse(isExpanded ? null : c.id)}>
                          <User className="w-3 h-3" />
                          {teachers.length} teacher{teachers.length > 1 ? "s" : ""}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 space-y-1">
                            {teachers.map(t => (
                              <div key={t.id} className="text-xs text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded-lg">{t.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Allocations Tab */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredAllocs.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">No teacher assignments yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Teacher", "Courses", "Group", "Semester", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllocs.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="font-semibold text-slate-900">{a.lecturer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(a.courses_details || []).map(c => (
                            <span key={c.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-bold">{c.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold">
                          {a.group_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{a.semester_name}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => openDeleteAlloc(a)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Course Modal */}
      {(modal === "create-course" || modal === "edit-course") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{modal === "create-course" ? "Add Course" : "Edit Course"}</h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Course Name *</label>
                <input value={courseForm.name} onChange={e => setCourseForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Description</label>
                <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Brief course description..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modal === "create-course" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {modal === "delete-course" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-2">Delete Course?</h3>
            <p className="text-sm text-slate-500 mb-6"><span className="font-bold text-slate-800">{selected.name}</span> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDeleteCourse} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {modal === "create-alloc" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Assign Teacher to Course</h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAllocSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Teacher *</label>
                <select value={allocForm.lecturer} onChange={e => setAllocForm(f => ({ ...f, lecturer: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select teacher...</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.lecturer_id || l.id}>
                      {l.lecturer?.first_name ? `${l.lecturer.first_name} ${l.lecturer.last_name}`.trim() : l.lecturer?.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Courses * (hold Ctrl to select multiple)</label>
                <select multiple value={allocForm.courses}
                  onChange={e => setAllocForm(f => ({ ...f, courses: Array.from(e.target.selectedOptions, o => o.value) }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-28">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Group *</label>
                <select value={allocForm.group} onChange={e => setAllocForm(f => ({ ...f, group: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select group...</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Semester *</label>
                <select value={allocForm.semester} onChange={e => setAllocForm(f => ({ ...f, semester: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="">Select semester...</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Allocation Modal */}
      {modal === "delete-alloc" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-2">Remove Assignment?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-bold text-slate-800">{selected.lecturer_name}</span> will be unassigned from this course/group.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200">Cancel</button>
              <button onClick={handleDeleteAlloc} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-black uppercase rounded-xl hover:bg-rose-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default AccountantCourses;
