import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar, Users, ChevronLeft, Save, Loader2,
  CheckCircle, XCircle, Clock, BookOpen, AlertCircle, Search
} from "lucide-react";
import api from "../../api";

const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

const TeacherAttendance = () => {
  const { allocationId } = useParams();

  const [allocation,       setAllocation]       = useState(null);
  const [schedules,        setSchedules]        = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students,         setStudents]         = useState([]);
  const [attendance,       setAttendance]       = useState({});
  const [studentStats,     setStudentStats]     = useState({});
  const [search,           setSearch]           = useState("");
  const [loading,          setLoading]          = useState(true);
  const [loadingStudents,  setLoadingStudents]  = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [toast,            setToast]            = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res   = await api.get("api/teacher-allocations/");
        const alloc = (res.data || []).find(a => a.id === parseInt(allocationId));
        if (!alloc) return;
        setAllocation(alloc);

        const courseIds = (alloc.courses_details || []).map(c => c.id);
        if (!alloc.group || courseIds.length === 0) return;

        const [schRes, studRes] = await Promise.allSettled([
          api.get("attendance/schedules/", { params: { group: alloc.group } }),
          api.get(`accounts/students/by-group/${alloc.group}/`),
        ]);

        const rawStudents = studRes.status === "fulfilled"
          ? studRes.value.data?.students || studRes.value.data || []
          : [];
        setStudents(rawStudents);

        if (schRes.status === "fulfilled") {
          const all      = Array.isArray(schRes.value.data) ? schRes.value.data : schRes.value.data?.results || [];
          const filtered = all.filter(s => courseIds.includes(s.course));
          setSchedules(filtered);
          if (rawStudents.length > 0 && filtered.length > 0) {
            fetchAttendanceStats(rawStudents, filtered);
          }
        }
      } catch {
        showToast("error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [allocationId]);

  const fetchAttendanceStats = async (studentsList, schedulesList) => {
    try {
      const attRes  = await api.get("attendance/attendances/", {
        params: { group: schedulesList[0]?.group },
      });
      const records = Array.isArray(attRes.data) ? attRes.data : attRes.data?.results || [];
      const total   = schedulesList.length;
      const stats   = {};
      studentsList.forEach(s => {
        const present = records.filter(r => (r.Student || r.student) === s.id && r.status).length;
        stats[s.id]   = { present, total };
      });
      setStudentStats(stats);
    } catch { /* optional */ }
  };

  const handleSelectSchedule = async (schedule) => {
    if (selectedSchedule?.id === schedule.id) return;
    setSelectedSchedule(schedule);
    setSearch("");
    setLoadingStudents(true);
    try {
      const attRes  = await api.get("attendance/attendances/", { params: { shcedule: schedule.id } });
      const attList = Array.isArray(attRes.data) ? attRes.data : attRes.data?.results || [];
      const map     = {};
      attList.forEach(r => { map[r.Student || r.student] = r.status; });
      students.forEach(s => { if (map[s.id] === undefined) map[s.id] = false; });
      setAttendance(map);
    } catch {
      const map = {};
      students.forEach(s => { map[s.id] = false; });
      setAttendance(map);
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggle  = (id) => setAttendance(p => ({ ...p, [id]: !p[id] }));
  const markAll = (val) => {
    const map = {};
    students.forEach(s => { map[s.id] = val; });
    setAttendance(map);
  };

  const handleSave = async () => {
    if (!selectedSchedule) return;
    setSaving(true);
    try {
      await api.post("attendance/attendances/bulk_update/", {
        schedule_id: selectedSchedule.id,
        attendances: students.map(s => ({ student_id: s.id, status: attendance[s.id] || false })),
      });
      showToast("success", "Attendance saved!");
      fetchAttendanceStats(students, schedules);
    } catch {
      showToast("error", "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s => {
      const u = s.student || {};
      return `${u.first_name||""} ${u.last_name||""} ${u.username||""}`.toLowerCase().includes(q);
    });
  }, [students, search]);

  const presentCount = students.filter(s => attendance[s.id]).length;
  const absentCount  = students.length - presentCount;
  const pct          = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  const schedulesByDay = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day);
    return acc;
  }, {});

  const courseName = allocation?.courses_details?.[0]?.name || "Course";
  const groupName  = allocation?.group_name || `Group #${allocation?.group}`;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher/courses"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Attendance — {courseName}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {groupName}
                <span className="text-slate-300">·</span>
                {students.length} students
              </p>
            </div>
          </div>
          {selectedSchedule && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm shadow-green-200">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {toast && (
          <div className={`mb-5 p-4 rounded-2xl flex items-center gap-3 border text-sm font-bold ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}>
            {toast.type === "success"
              ? <CheckCircle className="w-5 h-5 shrink-0" />
              : <AlertCircle  className="w-5 h-5 shrink-0" />}
            {toast.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Schedule picker ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="font-bold text-slate-900 text-sm">Select Lesson</h2>
                {schedules.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {schedules.length}
                  </span>
                )}
              </div>

              {schedules.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">No schedule found</p>
                  <p className="text-xs text-slate-300 mt-1">Ask admin to create schedule</p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {DAYS.map(day => {
                    const daySchedules = schedulesByDay[day];
                    if (!daySchedules?.length) return null;
                    const isToday = day === today;
                    return (
                      <div key={day}>
                        <div className="flex items-center gap-2 px-3 py-2 mt-1">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-green-600" : "text-slate-400"}`}>
                            {day}
                          </p>
                          {isToday && (
                            <span className="text-[9px] font-black text-white bg-green-500 px-1.5 py-0.5 rounded-full uppercase">
                              Today
                            </span>
                          )}
                        </div>
                        {daySchedules.map(sch => {
                          const isSelected = selectedSchedule?.id === sch.id;
                          return (
                            <button key={sch.id} onClick={() => handleSelectSchedule(sch)}
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all mb-0.5 ${
                                isSelected ? "bg-green-600 text-white" : "hover:bg-slate-50"
                              }`}>
                              <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                                {sch.course_title || courseName}
                              </p>
                              <p className={`text-xs mt-0.5 flex items-center gap-1 ${isSelected ? "text-green-100" : "text-slate-400"}`}>
                                <Clock className="w-3 h-3" />
                                {sch.start_time} – {sch.end_time}
                                {sch.date && (
                                  <span className={`ml-1 ${isSelected ? "text-green-200" : "text-slate-300"}`}>
                                    · {new Date(sch.date).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                                  </span>
                                )}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Students ── */}
          <div className="lg:col-span-2">
            {!selectedSchedule ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-green-200" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Pick a lesson</p>
                  <p className="text-sm text-slate-400 mt-1">Select a lesson from the schedule on the left</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loadingStudents ? (
                  <div className="py-16 flex justify-center">
                    <Loader2 className="w-7 h-7 text-green-600 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Progress + stats */}
                    <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-slate-900">
                          {selectedSchedule.course_title || courseName}
                          <span className="ml-2 text-sm font-normal text-slate-400">
                            {selectedSchedule.day} · {selectedSchedule.start_time}
                            {selectedSchedule.date && (
                              <> · {new Date(selectedSchedule.date).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</>
                            )}
                          </span>
                        </p>
                        <span className={`text-2xl font-black ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-500" : "text-rose-600"}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald-600 font-bold">{presentCount} present</span>
                          <span className="text-rose-500 font-bold">{absentCount} absent</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => markAll(true)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">
                            ✓ All Present
                          </button>
                          <button onClick={() => markAll(false)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                            ✗ All Absent
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="px-5 py-3 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Search student..."
                          value={search} onChange={e => setSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Student list */}
                    {students.length === 0 ? (
                      <div className="py-12 text-center">
                        <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="font-bold text-slate-400 text-sm">No students found</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                        {filteredStudents.map((s, idx) => {
                          const present  = attendance[s.id] || false;
                          const user     = s.student || {};
                          const name     = `${user.first_name||""} ${user.last_name||""}`.trim() || user.username || `#${s.id}`;
                          const init     = name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase();
                          const stats    = studentStats[s.id];
                          const statPct  = stats?.total > 0 ? Math.round((stats.present / stats.total) * 100) : null;

                          return (
                            <div key={s.id} onClick={() => toggle(s.id)}
                              className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all select-none ${
                                present ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-slate-50"
                              }`}>
                              <div className="flex items-center gap-3.5">
                                <span className="text-xs text-slate-300 font-bold w-5 text-center shrink-0">{idx + 1}</span>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors shrink-0 ${
                                  present ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {init}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-slate-400">{user.username || ""}</p>
                                    {statPct !== null && (
                                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                        statPct >= 75 ? "bg-emerald-100 text-emerald-600"
                                        : statPct >= 50 ? "bg-amber-100 text-amber-600"
                                        : "bg-rose-100 text-rose-600"
                                      }`}>
                                        {statPct}% overall
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                present ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {present
                                  ? <><CheckCircle className="w-3.5 h-3.5" /> Present</>
                                  : <><XCircle    className="w-3.5 h-3.5" /> Absent</>
                                }
                              </div>
                            </div>
                          );
                        })}
                        {filteredStudents.length === 0 && (
                          <div className="py-8 text-center text-slate-400 text-sm font-bold">
                            No students match "{search}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer save */}
                    {students.length > 0 && (
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Attendance
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
