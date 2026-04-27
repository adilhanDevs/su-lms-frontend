import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  Calendar,
  Layers,
  Users,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  FileText,
  Clock,
  Grid
} from "lucide-react";

// Enhanced modal component
function Modal({ open, title, onClose, children, size = "md" }) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// Enhanced table row component
function TableRow({ children, onClick }) {
  return (
    <tr 
      onClick={onClick}
      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      {children}
    </tr>
  );
}

// ==================== COURSE ALLOCATIONS ====================
function CourseAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const emptyForm = {
    id: null,
    lecturer: null,
    courses: [],
    group: null,
    semester: null,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get("/accounts/groups/");
      setGroups(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки групп:", e);
    }
  }, []);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await api.get("/api/semesters/");
      setSemesters(
        Array.isArray(res.data) ? res.data : res.data?.results || []
      );
    } catch (e) {
      console.error("Ошибка загрузки семестров:", e);
      setSemesters([]);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/course-allocations/");
      setAllocations(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить назначения");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLecturers = useCallback(async () => {
    try {
      const res = await api.get("/accounts/lecturers/");
      setLecturers(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки преподавателей:", e);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/api/courses/");
      setAvailableCourses(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки курсов:", e);
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchLecturers();
    fetchCourses();
    fetchGroups();
    fetchSemesters();
  }, [fetchList, fetchLecturers, fetchCourses, fetchGroups, fetchSemesters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        lecturer: parseInt(form.lecturer),
        courses: form.courses.map((c) => parseInt(c)),
        group: parseInt(form.group),
        semester: parseInt(form.semester),
      };
      const res = await api.post("/api/course-allocations/create/", payload);
      setAllocations((s) => [res.data, ...s]);
      setIsCreateOpen(false);
      setForm(emptyForm);
      fetchList();
    } catch (err) {
      console.error(err);
      alert(
        "Ошибка при создании: " +
          JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/api/course-allocations/${id}/`);
      setSelected(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
      alert("Не удалось получить данные");
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await api.get(`/api/course-allocations/${id}/`);
      const formData = {
        id: res.data.id,
        lecturer: res.data.lecturer_id || null,
        courses: res.data.courses?.map((c) => c.id) || [],
        group: res.data.group_id || null,
        semester: res.data.semester_id || null,
      };
      setForm(formData);
      setIsEditOpen(true);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить данные для редактирования");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const lecturerId =
        typeof form.lecturer === "number"
          ? form.lecturer
          : parseInt(form.lecturer);
      const groupId =
        typeof form.group === "number" ? form.group : parseInt(form.group);
      const semesterId =
        typeof form.semester === "number"
          ? form.semester
          : parseInt(form.semester);

      if (
        !lecturerId ||
        !groupId ||
        !semesterId ||
        isNaN(lecturerId) ||
        isNaN(groupId) ||
        isNaN(semesterId)
      ) {
        alert("Пожалуйста, выберите все обязательные поля");
        return;
      }

      const payload = {
        lecturer: lecturerId,
        courses: form.courses.map((c) =>
          typeof c === "number" ? c : parseInt(c)
        ),
        group: groupId,
        semester: semesterId,
      };

      const res = await api.patch(
        `/api/course-allocations/${form.id}/`,
        payload
      );
      setAllocations((s) =>
        s.map((it) => (it.id === res.data.id ? res.data : it))
      );
      setIsEditOpen(false);
      setForm(emptyForm);
      fetchList();
    } catch (err) {
      console.error(err);
      alert(
        "Ошибка при обновлении: " +
          JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить назначение?")) return;
    try {
      await api.delete(`/api/course-allocations/${id}/`);
      setAllocations((s) => s.filter((it) => it.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  const onChange = (field) => (e) => {
    let value = e?.target ? e.target.value : e;
    if (["lecturer", "group", "semester"].includes(field)) {
      if (value === "" || value === null || value === undefined) {
        value = null;
      } else {
        const parsed = parseInt(value, 10);
        value = isNaN(parsed) ? null : parsed;
      }
    }
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleCourseInForm = (courseId) => {
    setForm((f) => ({
      ...f,
      courses: f.courses.includes(courseId)
        ? f.courses.filter((c) => c !== courseId)
        : [...f.courses, courseId],
    }));
  };

  const getLecturerUserId = (l) => l.lecturer_id || l.lecturer?.id;
  const getLecturerDisplayName = (l) => {
    const firstName = l.lecturer?.first_name || "";
    const lastName = l.lecturer?.last_name || "";
    const username = l.lecturer?.username || "";
    return `${firstName} ${lastName} (${username})`.trim();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Allocations</h2>
          <p className="text-gray-600 mt-1">Manage course assignments to lecturers and groups</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchList}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Allocation
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
      ) : allocations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Allocations Found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first course allocation</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Allocation
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Lecturer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allocations.map((a) => (
                  <TableRow key={a.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{a.lecturer || "-"}</p>
                          <p className="text-xs text-gray-500">Lecturer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {a.group || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{a.semester || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {a.courses?.length > 0
                          ? a.courses.map((c, idx) => (
                              <span
                                key={c.id || idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {c.name?.substring(0, 20) || c}
                              </span>
                            ))
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDetail(a.id)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEdit(a.id)}
                          className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={isCreateOpen}
        title="Create Course Allocation"
        onClose={() => setIsCreateOpen(false)}
        size="lg"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group
                </span>
              </label>
              <select
                value={form.group || ""}
                onChange={onChange("group")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Semester
                </span>
              </label>
              <select
                value={form.semester || ""}
                onChange={onChange("semester")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Lecturer
              </span>
            </label>
            <select
              value={form.lecturer || ""}
              onChange={onChange("lecturer")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((l) => (
                <option key={l.id} value={getLecturerUserId(l)}>
                  {getLecturerDisplayName(l)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses
              </span>
            </label>
            <div className="border border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.courses.includes(course.id)}
                      onChange={() => toggleCourseInForm(course.id)}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-gray-500 mt-1">{course.description.substring(0, 60)}...</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Allocation
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit Course Allocation"
        onClose={() => setIsEditOpen(false)}
        size="lg"
      >
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {/* Same form structure as create */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
              <select
                value={form.group || ""}
                onChange={onChange("group")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={form.semester || ""}
                onChange={onChange("semester")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer</label>
            <select
              value={form.lecturer || ""}
              onChange={onChange("lecturer")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Lecturer</option>
              {lecturers.map((l) => (
                <option key={l.id} value={getLecturerUserId(l)}>
                  {getLecturerDisplayName(l)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
            <div className="border border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.courses.includes(course.id)}
                      onChange={() => toggleCourseInForm(course.id)}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-gray-500 mt-1">{course.description.substring(0, 60)}...</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsEditOpen(false);
                setForm(emptyForm);
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg shadow-yellow-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isDetailOpen}
        title={`Allocation Details #${selected?.id || ""}`}
        onClose={() => setIsDetailOpen(false)}
      >
        {selected ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lecturer</p>
                    <p className="font-semibold text-gray-900">{selected.lecturer || "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Group</p>
                    <p className="font-semibold text-gray-900">{selected.group || "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Semester</p>
                    <p className="font-semibold text-gray-900">{selected.semester || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Assigned Courses
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(selected.courses || []).map((c, idx) => (
                  <div key={c.id || idx} className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="font-medium text-gray-900">{c.name || c}</p>
                    {c.description && (
                      <p className="text-sm text-gray-600 mt-1">{c.description.substring(0, 80)}...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  openEdit(selected.id);
                }}
                className="px-5 py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Allocation
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Allocation
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ==================== ACADEMIC YEARS ====================
function AcademicYears({ programs }) {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    year: "",
    program: "",
    is_current: false,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAcademicYears = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/academic-years/");
      setAcademicYears(res.data || []);
    } catch (e) {
      console.error("Error fetching academic years:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        year: parseInt(form.year),
        program: parseInt(form.program),
        is_current: form.is_current,
      };
      const res = await api.post("/api/academic-years/create/", payload);
      setAcademicYears([...academicYears, res.data]);
      setIsCreateOpen(false);
      setForm({ year: "", program: "", is_current: false });
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании учебного года");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        year: parseInt(form.year),
        program: parseInt(form.program),
        is_current: form.is_current,
      };
      const res = await api.patch(
        `/api/academic-years/${editingId}/update/`,
        payload
      );
      setAcademicYears(
        academicYears.map((ay) => (ay.id === editingId ? res.data : ay))
      );
      setIsEditOpen(false);
      setForm({ year: "", program: "", is_current: false });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить учебный год?")) return;
    try {
      await api.delete(`/api/academic-years/${id}/`);
      setAcademicYears(academicYears.filter((ay) => ay.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  const openEdit = (ay) => {
    setForm({
      year: ay.year,
      program: ay.program?.id || ay.program,
      is_current: ay.is_current,
    });
    setEditingId(ay.id);
    setIsEditOpen(true);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Academic Years</h3>
          <p className="text-gray-600 mt-1">Manage academic years and their programs</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 self-start"
        >
          <Plus className="w-5 h-5" />
          New Academic Year
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Academic Years</h3>
          <p className="text-gray-600 mb-6">Create your first academic year to get started</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Academic Year
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {academicYears.map((ay) => (
                  <TableRow key={ay.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Year {ay.year}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">{ay.program?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ay.is_current ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(ay)}
                          className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(ay.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={isCreateOpen}
        title="Add Academic Year"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Year
              </span>
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Program
              </span>
            </label>
            <select
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_current"
              checked={form.is_current}
              onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-all"
            />
            <label htmlFor="is_current" className="text-sm font-medium text-gray-700 cursor-pointer">
              Set as Current Academic Year
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Academic Year
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit Academic Year"
        onClose={() => setIsEditOpen(false)}
      >
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <select
              value={form.program}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="edit_is_current"
              checked={form.is_current}
              onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 transition-all"
            />
            <label htmlFor="edit_is_current" className="text-sm font-medium text-gray-700 cursor-pointer">
              Set as Current Academic Year
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg shadow-yellow-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==================== SEMESTERS ====================
function Semesters({ academicYears, courses: availableCourses }) {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "First",
    academic_year: "",
    is_current: false,
    courses: [],
  });
  const [editingId, setEditingId] = useState(null);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/semesters/");
      setSemesters(res.data || []);
    } catch (e) {
      console.error("Error fetching semesters:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        academic_year: parseInt(form.academic_year),
      };
      if (form.courses.length > 0) {
        payload.courses = form.courses;
      }
      const res = await api.post("/api/semesters/create/", payload);
      setSemesters([...semesters, res.data]);
      setIsCreateOpen(false);
      setForm({
        name: "First",
        academic_year: "",
        is_current: false,
        courses: [],
      });
    } catch (err) {
      console.error(err);
      alert(
        "Ошибка при создании семестра: " +
          JSON.stringify(err.response?.data || err.message)
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        academic_year: parseInt(form.academic_year),
        is_current: form.is_current,
        courses: form.courses,
      };
      const res = await api.patch(
        `/api/semesters/${editingId}/update/`,
        payload
      );
      setSemesters(semesters.map((s) => (s.id === editingId ? res.data : s)));
      setIsEditOpen(false);
      setForm({
        name: "First",
        academic_year: "",
        is_current: false,
        courses: [],
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить семестр?")) return;
    try {
      await api.delete(`/api/semesters/${id}/`);
      setSemesters(semesters.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  const openEdit = (s) => {
    setForm({
      name: s.name,
      academic_year: s.academic_year?.id || s.academic_year,
      is_current: s.is_current || false,
      courses: s.courses?.map((c) => c.id) || [],
    });
    setEditingId(s.id);
    setIsEditOpen(true);
  };

  const toggleCourse = (courseId) => {
    setForm((f) => ({
      ...f,
      courses: f.courses.includes(courseId)
        ? f.courses.filter((c) => c !== courseId)
        : [...f.courses, courseId],
    }));
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Semesters</h3>
          <p className="text-gray-600 mt-1">Manage academic semesters and course assignments</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 self-start"
        >
          <Plus className="w-5 h-5" />
          New Semester
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : semesters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Semesters</h3>
          <p className="text-gray-600 mb-6">Create your first semester to organize courses</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Semester
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {semesters.map((s) => (
                  <TableRow key={s.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-700">Year {s.academic_year?.year}</p>
                          <p className="text-xs text-gray-500">{s.academic_year?.program?.name || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.is_current ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Current
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.courses?.length > 0
                          ? s.courses.slice(0, 2).map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {c.name}
                              </span>
                            ))
                          : "-"}
                        {s.courses?.length > 2 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{s.courses.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={isCreateOpen}
        title="Add Semester"
        onClose={() => setIsCreateOpen(false)}
        size="lg"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Name
                </span>
              </label>
              <select
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="First">First Semester</option>
                <option value="Second">Second Semester</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Academic Year
                </span>
              </label>
              <select
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    Year {ay.year} - {ay.program?.name || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses (Optional)
              </span>
            </label>
            <div className="border border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.courses.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-gray-500 mt-1">{course.description.substring(0, 60)}...</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Semester
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit Semester"
        onClose={() => setIsEditOpen(false)}
        size="lg"
      >
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <select
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="First">First Semester</option>
                <option value="Second">Second Semester</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    Year {ay.year} - {ay.program?.name || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
            <div className="border border-gray-300 rounded-xl p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.courses.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-gray-500 mt-1">{course.description.substring(0, 60)}...</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg shadow-yellow-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==================== MODULES ====================
function Modules({ semesters }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "First",
    semester: "",
    is_current: false,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/modules/");
      setModules(res.data || []);
    } catch (e) {
      console.error("Error fetching modules:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        semester: parseInt(form.semester),
      };
      const res = await api.post("/api/modules/create/", payload);
      setModules([...modules, res.data]);
      setIsCreateOpen(false);
      setForm({ name: "First", semester: "", is_current: false });
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании модуля");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        semester: parseInt(form.semester),
      };
      const res = await api.patch(`/api/modules/${editingId}/update/`, payload);
      setModules(modules.map((m) => (m.id === editingId ? res.data : m)));
      setIsEditOpen(false);
      setForm({ name: "First", semester: "", is_current: false });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить модуль?")) return;
    try {
      await api.delete(`/api/modules/${id}/`);
      setModules(modules.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    }
  };

  const openEdit = (m) => {
    setForm({
      name: m.name,
      semester: m.semester?.id || m.semester,
      is_current: m.is_current,
    });
    setEditingId(m.id);
    setIsEditOpen(true);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Modules</h3>
          <p className="text-gray-600 mt-1">Organize courses into modules within semesters</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 self-start"
        >
          <Plus className="w-5 h-5" />
          New Module
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules</h3>
          <p className="text-gray-600 mb-6">Create modules to better organize your curriculum</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Module
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {modules.map((m) => (
                  <TableRow key={m.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{m.name} Module</p>
                          <p className="text-sm text-gray-500">ID: {m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-gray-700">{m.semester?.name || "-"}</p>
                          <p className="text-xs text-gray-500">Year {m.semester?.academic_year?.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.is_current ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={isCreateOpen}
        title="Add Module"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Module Name
              </span>
            </label>
            <select
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            >
              <option value="First">First Module</option>
              <option value="Second">Second Module</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Semester
              </span>
            </label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - Year {s.academic_year?.year || ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Module
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit Module"
        onClose={() => setIsEditOpen(false)}
      >
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
            <select
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="First">First Module</option>
              <option value="Second">Second Module</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - Year {s.academic_year?.year || ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg shadow-yellow-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeTab, setActiveTab] = useState("programs");
  const [newProgram, setNewProgram] = useState({ name: "" });
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await api.get("/api/programs/");
      setPrograms(response.data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get("/api/courses/");
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const response = await api.get("/api/academic-years/");
      setAcademicYears(response.data || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  }, []);

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await api.get("/api/semesters/");
      setSemesters(response.data || []);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
    fetchCourses();
    fetchAcademicYears();
    fetchSemesters();
  }, [fetchPrograms, fetchCourses, fetchAcademicYears, fetchSemesters]);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/programs/create/", newProgram);
      setPrograms([...programs, response.data]);
      setNewProgram({ name: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding program:", error);
      alert("Error adding program. Please try again.");
    }
  };

  const handleEditProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/api/programs/${editingProgram.id}/update/`,
        editingProgram
      );
      setPrograms(
        programs.map((p) => (p.id === editingProgram.id ? response.data : p))
      );
      setEditingProgram(null);
    } catch (error) {
      console.error("Error updating program:", error);
      alert("Error updating program. Please try again.");
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await api.delete(`/api/programs/${programId}/`);
        setPrograms(programs.filter((p) => p.id !== programId));
      } catch (error) {
        console.error("Error deleting program:", error);
        alert("Error deleting program. Please try again.");
      }
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/courses/create/", newCourse);
      setCourses([...courses, response.data]);
      setNewCourse({ name: "", description: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding course:", error);
      alert(
        `Error adding course: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "Please check all required fields"
        }`
      );
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/courses/${editingCourse.id}/`, {
        name: editingCourse.name,
        description: editingCourse.description,
      });
      setCourses(
        courses.map((c) => (c.id === editingCourse.id ? response.data : c))
      );
      setEditingCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
      alert(
        `Error updating course: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "Please try again"
        }`
      );
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the course "${courseName}"?`
      )
    ) {
      try {
        await api.delete(`/api/courses/${courseId}/`);
        setCourses(courses.filter((c) => c.id !== courseId));
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Error deleting course. Please try again.");
      }
    }
  };

  const startEditingProgram = (program) => setEditingProgram({ ...program });
  const startEditingCourse = (course) => setEditingCourse({ ...course });
  const cancelEditing = () => {
    setEditingProgram(null);
    setEditingCourse(null);
  };

  const tabs = [
    { id: "programs", label: "Programs", icon: <FileText className="w-4 h-4" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { id: "academic-years", label: "Academic Years", icon: <Calendar className="w-4 h-4" /> },
    { id: "semesters", label: "Semesters", icon: <Layers className="w-4 h-4" /> },
    { id: "modules", label: "Modules", icon: <Layers className="w-4 h-4" /> },
    { id: "allocations", label: "Course Allocations", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Management</h1>
            <p className="text-gray-600 mt-1">Manage programs, courses, semesters, and allocations</p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Programs</p>
                <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Academic Years</p>
                <p className="text-2xl font-bold text-gray-900">{academicYears.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Semesters</p>
                <p className="text-2xl font-bold text-gray-900">{semesters.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Layers className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Programs Tab */}
            {activeTab === "programs" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Programs</h2>
                    <p className="text-gray-600 mt-1">Manage academic programs and degrees</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 self-start"
                  >
                    <Plus className="w-5 h-5" />
                    Add Program
                  </button>
                </div>

                {showAddForm && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Program
                    </h3>
                    <form onSubmit={handleAddProgram} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Program name (e.g., Computer Science)"
                          value={newProgram.name}
                          onChange={(e) =>
                            setNewProgram({ ...newProgram, name: e.target.value })
                          }
                          required
                          className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Add Program
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingProgram && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Edit Program
                    </h3>
                    <form onSubmit={handleEditProgram} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Program name"
                        value={editingProgram.name}
                        onChange={(e) =>
                          setEditingProgram({
                            ...editingProgram,
                            name: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-3 border border-yellow-300 bg-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {programs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programs Found</h3>
                    <p className="text-gray-600">Add your first program to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => (
                      <div
                        key={program.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{program.name}</h4>
                            <p className="text-sm text-gray-500">ID: {program.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingProgram(program)}
                              className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-yellow-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteProgram(program.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Courses</h2>
                    <p className="text-gray-600 mt-1">Manage all courses and their details</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 self-start"
                  >
                    <Plus className="w-5 h-5" />
                    Add Course
                  </button>
                </div>

                {showAddForm && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Course
                    </h3>
                    <form onSubmit={handleAddCourse} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Course name (e.g., Introduction to Programming)"
                        value={newCourse.name}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <textarea
                        placeholder="Course description (optional)"
                        value={newCourse.description}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, description: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Add Course
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {editingCourse && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Edit2 className="w-5 h-5" />
                      Edit Course
                    </h3>
                    <form onSubmit={handleEditCourse} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Course name"
                        value={editingCourse.name}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 border border-yellow-300 bg-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      <textarea
                        placeholder="Course description"
                        value={editingCourse.description || ""}
                        onChange={(e) =>
                          setEditingCourse({
                            ...editingCourse,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-yellow-300 bg-white rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
                    <p className="text-gray-600">Add your first course to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{course.name}</h4>
                            <p className="text-sm text-gray-500">ID: {course.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingCourse(course)}
                              className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-yellow-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.name)}
                              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Academic Years Tab */}
            {activeTab === "academic-years" && <AcademicYears programs={programs} />}

            {/* Semesters Tab */}
            {activeTab === "semesters" && (
              <Semesters academicYears={academicYears} courses={courses} />
            )}

            {/* Modules Tab */}
            {activeTab === "modules" && <Modules semesters={semesters} />}

            {/* Course Allocations Tab */}
            {activeTab === "allocations" && <CourseAllocations />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;