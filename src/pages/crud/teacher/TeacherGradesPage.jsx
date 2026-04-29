import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, Users, ChevronLeft, Save, Loader2, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../../api";

const MODULES = [
  { key: "1st_module", label: "Module 1", endpoint: "result/api/grade-1st-modules/" },
  { key: "2nd_module", label: "Module 2", endpoint: "result/api/grade-2nd-modules/" },
  { key: "semester",   label: "Final",    endpoint: "result/api/grade-semesters/" },
];

const getLetterGrade = (total) => {
  if (total >= 90) return { g: "A+", color: "bg-emerald-100 text-emerald-700" };
  if (total >= 85) return { g: "A",  color: "bg-emerald-100 text-emerald-700" };
  if (total >= 80) return { g: "A-", color: "bg-teal-100 text-teal-700" };
  if (total >= 75) return { g: "B+", color: "bg-blue-100 text-blue-700" };
  if (total >= 70) return { g: "B",  color: "bg-blue-100 text-blue-700" };
  if (total >= 65) return { g: "B-", color: "bg-indigo-100 text-indigo-700" };
  if (total >= 60) return { g: "C+", color: "bg-amber-100 text-amber-700" };
  if (total >= 55) return { g: "C",  color: "bg-amber-100 text-amber-700" };
  if (total >= 50) return { g: "C-", color: "bg-orange-100 text-orange-700" };
  if (total >= 40) return { g: "D",  color: "bg-rose-100 text-rose-700" };
  return             { g: "F",  color: "bg-red-100 text-red-700" };
};

const TeacherGradesPage = () => {
  const { allocationId } = useParams();
  const [allocation, setAllocation]   = useState(null);
  const [students,   setStudents]     = useState([]);
  // savedGrades: { [studentId]: { attendance, activities, exam } }  — last saved values from API
  const [savedGrades, setSavedGrades] = useState({});
  // rawInputs: { [studentId]: { attendance: string, activities: string, exam: string } }
  const [rawInputs,  setRawInputs]    = useState({});
  const [module,     setModule]       = useState("1st_module");
  const [loading,    setLoading]      = useState(true);
  const [saving,     setSaving]       = useState(false);
  const [toast,      setToast]        = useState(null);
  const isFinal = module === "semester";

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Load allocation + students once
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res   = await api.get("api/teacher-allocations/");
        const alloc = (res.data || []).find(a => a.id === parseInt(allocationId));
        if (!alloc) return;
        setAllocation(alloc);

        const studRes = await api.get(`accounts/students/by-group/${alloc.group}/`);
        const raw     = studRes.data?.students || studRes.data || [];
        setStudents(raw);
      } catch {
        showToast("error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [allocationId]);

  // Load grades when module or allocation changes
  const loadGrades = useCallback(async (alloc, mod) => {
    const courseId = alloc?.courses_details?.[0]?.id;
    if (!courseId) return;
    const m = MODULES.find(x => x.key === mod);
    try {
      const res  = await api.get(`${m.endpoint}?course=${courseId}`);
      const map  = {};
      (res.data || []).forEach(g => {
        map[g.student] = {
          attendance: g.attendance ?? 0,
          activities: g.activities ?? 0,
          exam:       g.exam       ?? 0,
        };
      });
      setSavedGrades(map);
      // Reset raw inputs to loaded values
      setRawInputs({});
    } catch {
      setSavedGrades({});
      setRawInputs({});
    }
  }, []);

  useEffect(() => {
    if (allocation) loadGrades(allocation, module);
  }, [allocation, module, loadGrades]);

  // Get display value (raw string if user typed, else saved value)
  const getDisplay = (sid, field) => {
    if (rawInputs[sid]?.[field] !== undefined) return rawInputs[sid][field];
    const saved = savedGrades[sid];
    if (saved) return String(saved[field] ?? 0);
    return "0";
  };

  // Parse to number for calculations
  const getParsed = (sid, field) => {
    const v = getDisplay(sid, field);
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const getTotal = (sid) => {
    if (isFinal) return getParsed(sid, "exam");
    return getParsed(sid, "attendance") + getParsed(sid, "activities") + getParsed(sid, "exam");
  };

  const setRaw = (sid, field, value) => {
    setRawInputs(prev => ({
      ...prev,
      [sid]: { ...(prev[sid] || {}), [field]: value },
    }));
  };

  // Move focus to next row's same field on Enter/ArrowDown
  const inputRefs = useRef({});
  const setInputRef = (sid, field, el) => {
    if (!inputRefs.current[sid]) inputRefs.current[sid] = {};
    inputRefs.current[sid][field] = el;
  };
  const handleKeyDown = (e, sidIndex, field) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextSid = students[sidIndex + 1]?.id;
      if (nextSid && inputRefs.current[nextSid]?.[field]) {
        inputRefs.current[nextSid][field].focus();
        inputRefs.current[nextSid][field].select();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevSid = students[sidIndex - 1]?.id;
      if (prevSid && inputRefs.current[prevSid]?.[field]) {
        inputRefs.current[prevSid][field].focus();
        inputRefs.current[prevSid][field].select();
      }
    }
  };

  const handleSave = async () => {
    const courseId = allocation?.courses_details?.[0]?.id;
    if (!courseId) return;
    setSaving(true);
    try {
      const gradesPayload = students
        .filter(s => s.id)
        .map(s => {
          if (isFinal) {
            const score = getParsed(s.id, "exam");
            return { student_id: s.id, attendance: 0, activities: 0, exam: score };
          }
          return {
            student_id: s.id,
            attendance: getParsed(s.id, "attendance"),
            activities: getParsed(s.id, "activities"),
            exam:       getParsed(s.id, "exam"),
          };
        });

      await api.post("result/api/lecturer/bulk-grades/bulk-update/", {
        course_id:  courseId,
        grade_type: module,
        grades:     gradesPayload,
      });
      showToast("success", `Grades saved for ${gradesPayload.length} students`);
      loadGrades(allocation, module);
    } catch (err) {
      showToast("error", err.response?.data?.detail || "Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const courseName = allocation?.courses_details?.[0]?.name || "Course";
  const groupName  = allocation?.group_name || `Group #${allocation?.group}`;
  const passingCount = students.filter(s => getTotal(s.id) >= 60).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher/courses" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{courseName}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> {groupName}
                <span className="text-slate-300">·</span>
                {students.length} students
              </p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Grades
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        {toast && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border text-sm font-bold ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-rose-50 border-rose-100 text-rose-800"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.text}
          </div>
        )}

        {/* Module selector + hint */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 inline-flex gap-1">
            {MODULES.map(m => (
              <button key={m.key} onClick={() => setModule(m.key)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  module === m.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Use <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">↑↓</kbd> to navigate rows
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Column headers */}
          {isFinal ? (
            <div className="grid grid-cols-[1fr_200px_100px] bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Student</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
                Final Score <span className="font-medium text-slate-300 normal-case">(0 – 100)</span>
              </div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">Grade</div>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_140px_140px_140px_90px_72px] bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Student</div>
              {[
                { label: "Attendance", max: 30 },
                { label: "Activities", max: 30 },
                { label: "Exam",       max: 40 },
              ].map(col => (
                <div key={col.label} className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
                  {col.label}<br />
                  <span className="font-medium text-slate-300 normal-case text-[10px]">max {col.max}</span>
                </div>
              ))}
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">Total</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">Grade</div>
            </div>
          )}

          {students.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="font-bold text-slate-400">No students in this group</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((s, idx) => {
                const sid   = s.id;
                const user  = s.student || {};
                const name  = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || `#${sid}`;
                const init  = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const t     = getTotal(sid);
                const { g: lg, color } = t > 0 ? getLetterGrade(t) : { g: "—", color: "bg-slate-100 text-slate-400" };

                const inputCls = "w-full text-center px-2 py-2 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 focus:outline-none transition-colors bg-white";

                return isFinal ? (
                  <div key={sid} className="grid grid-cols-[1fr_200px_100px] px-6 py-3.5 items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center shrink-0">
                        {init}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{name}</p>
                        <p className="text-xs text-slate-400">{user.username || ""}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="number" min="0" max="100" step="1"
                        value={getDisplay(sid, "exam")}
                        ref={el => setInputRef(sid, "exam", el)}
                        onChange={e => setRaw(sid, "exam", e.target.value)}
                        onFocus={e => e.target.select()}
                        onKeyDown={e => handleKeyDown(e, idx, "exam")}
                        className={inputCls}
                        placeholder="0–100"
                      />
                    </div>
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black ${color}`}>{lg}</span>
                    </div>
                  </div>
                ) : (
                  <div key={sid} className="grid grid-cols-[1fr_140px_140px_140px_90px_72px] px-6 py-3.5 items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center shrink-0">
                        {init}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{name}</p>
                        <p className="text-xs text-slate-400">{user.username || ""}</p>
                      </div>
                    </div>
                    {["attendance", "activities", "exam"].map(field => (
                      <div key={field} className="flex justify-center px-1">
                        <input
                          type="number"
                          min="0"
                          max={field === "exam" ? 40 : 30}
                          step="0.5"
                          value={getDisplay(sid, field)}
                          ref={el => setInputRef(sid, field, el)}
                          onChange={e => setRaw(sid, field, e.target.value)}
                          onFocus={e => e.target.select()}
                          onKeyDown={e => handleKeyDown(e, idx, field)}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                    ))}
                    <div className="text-center">
                      <span className={`text-base font-black ${t >= 60 ? "text-emerald-600" : t > 0 ? "text-rose-600" : "text-slate-300"}`}>
                        {t > 0 ? t.toFixed(1) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${color}`}>{lg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {students.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-500">
                  Total: <span className="font-bold text-slate-900">{students.length}</span>
                </span>
                <span className="text-emerald-600">
                  Passing: <span className="font-bold">{passingCount}</span>
                </span>
                <span className="text-rose-500">
                  Failing: <span className="font-bold">{students.filter(s => { const t2 = getTotal(s.id); return t2 > 0 && t2 < 60; }).length}</span>
                </span>
                {students.length > 0 && (
                  <span className="text-slate-500">
                    Avg: <span className="font-bold text-slate-900">
                      {(students.reduce((acc, s) => acc + getTotal(s.id), 0) / students.length).toFixed(1)}
                    </span>
                  </span>
                )}
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGradesPage;
