import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, BookOpen, Users, Loader2, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Save, Search, ArrowLeft, MapPin, AlertCircle
} from "lucide-react";
import api from "../../../api";

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_SHORT = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
const DOW = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

const toDS = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayStr = toDS(new Date());

// ─── VIEW STATES ───
const VIEW_CALENDAR = "calendar";
const VIEW_SCHEDULE = "schedule";
const VIEW_ATTENDANCE = "attendance";

const css = `
@keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeSlideRight { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
@keyframes popIn { 0% { transform:scale(0.8); opacity:0; } 60% { transform:scale(1.05); } 100% { transform:scale(1); opacity:1; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes pulse2 { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
.anim-up { animation: fadeSlideUp 0.4s cubic-bezier(.22,1,.36,1) forwards; }
.anim-right { animation: fadeSlideRight 0.35s cubic-bezier(.22,1,.36,1) forwards; }
.anim-pop { animation: popIn 0.35s cubic-bezier(.22,1,.36,1) forwards; }
.anim-shimmer { background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.08) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
.anim-pulse2 { animation: pulse2 2s ease-in-out infinite; }
.day-cell { transition: all 0.2s cubic-bezier(.22,1,.36,1); }
.day-cell:hover { transform: translateY(-2px); }
.lesson-card { transition: all 0.25s cubic-bezier(.22,1,.36,1); }
.lesson-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 12px 28px -8px rgba(0,0,0,0.12); }
.student-row { transition: all 0.15s ease; }
.student-row:hover { transform: translateX(4px); }
`;

const TeacherCalendarAttendance = () => {
  const navigate = useNavigate();
  const [view, setView] = useState(VIEW_CALENDAR);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => { setToast({type,text}); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [s, a] = await Promise.allSettled([
        api.get("attendance/schedules/"),
        api.get("api/teacher-allocations/"),
      ]);
      if (s.status === "fulfilled") setSchedules(s.value.data || []);
      if (a.status === "fulfilled") setAllocations(a.value.data || []);
      setLoading(false);
    };
    init();
  }, []);

  // Map day names to JS getDay() values (0=Sun, 1=Mon, ...)
  const DAY_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };

  const schedulesByDate = useMemo(() => {
    const m = {};
    // 1. Schedules WITH a specific date
    schedules.forEach(s => { if (s.date) (m[s.date] ??= []).push(s); });

    // 2. Regular (dateless) schedules → project onto every matching weekday in current month
    const dateless = schedules.filter(s => !s.date && s.day);
    if (dateless.length > 0) {
      const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
      for (let d = 1; d <= totalDays; d++) {
        const dt = new Date(viewYear, viewMonth, d);
        const jsDow = dt.getDay(); // 0=Sun
        dateless.forEach(s => {
          if (DAY_MAP[s.day] === jsDow) {
            const ds = toDS(dt);
            (m[ds] ??= []).push(s);
          }
        });
      }
    }
    return m;
  }, [schedules, viewYear, viewMonth]);

  const datesSet = useMemo(() => new Set(Object.keys(schedulesByDate)), [schedulesByDate]);

  const calDays = useMemo(() => {
    let sd = new Date(viewYear, viewMonth, 1).getDay() - 1;
    if (sd < 0) sd = 6;
    const total = new Date(viewYear, viewMonth + 1, 0).getDate();
    const c = Array(sd).fill(null);
    for (let d = 1; d <= total; d++) c.push(new Date(viewYear, viewMonth, d));
    return c;
  }, [viewYear, viewMonth]);

  const getAllocId = useCallback((sch) => {
    const a = (allocations || []).find(
      al => al.group === sch.group && (al.courses || []).includes(sch.course)
    );
    return a?.id;
  }, [allocations]);

  const handleDateClick = (ds) => {
    if (!datesSet.has(ds)) return;
    setSelectedDate(ds);
    setSelectedLesson(null);
    setView(VIEW_SCHEDULE);
  };

  const handleLessonClick = async (sch) => {
    setSelectedLesson(sch);
    setView(VIEW_ATTENDANCE);
    setSearch("");
    setLoadingStudents(true);
    try {
      const allocId = getAllocId(sch);
      const alloc = allocations.find(a => a.id === allocId);
      if (!alloc) { setStudents([]); setLoadingStudents(false); return; }

      const [studRes, attRes] = await Promise.allSettled([
        api.get(`accounts/students/by-group/${alloc.group}/`),
        api.get("attendance/attendances/", { params: { shcedule: sch.id } }),
      ]);

      const stList = studRes.status === "fulfilled"
        ? (studRes.value.data?.students || studRes.value.data || []) : [];
      setStudents(stList);

      const attList = attRes.status === "fulfilled"
        ? (Array.isArray(attRes.value.data) ? attRes.value.data : attRes.value.data?.results || []) : [];
      const map = {};
      attList.forEach(r => { map[r.Student || r.student] = r.status; });
      stList.forEach(s => { if (map[s.id] === undefined) map[s.id] = false; });
      setAttendance(map);
    } catch { setStudents([]); setAttendance({}); }
    finally { setLoadingStudents(false); }
  };

  const toggle = id => setAttendance(p => ({ ...p, [id]: !p[id] }));
  const markAll = val => { const m = {}; students.forEach(s => { m[s.id] = val; }); setAttendance(m); };

  const handleSave = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      await api.post("attendance/attendances/bulk_update/", {
        schedule_id: selectedLesson.id,
        attendances: students.map(s => ({ student_id: s.id, status: attendance[s.id] || false })),
      });
      showToast("success", "Посещаемость сохранена!");
    } catch { showToast("error", "Ошибка сохранения"); }
    finally { setSaving(false); }
  };

  const goBack = () => {
    if (view === VIEW_ATTENDANCE) { setView(VIEW_SCHEDULE); setSelectedLesson(null); }
    else if (view === VIEW_SCHEDULE) { setView(VIEW_CALENDAR); setSelectedDate(null); }
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
  const pct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  const dayLessons = selectedDate ? (schedulesByDate[selectedDate] || []) : [];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 anim-pop px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.text}
        </div>
      )}

      {/* ═══════════════════ CALENDAR VIEW ═══════════════════ */}
      {view === VIEW_CALENDAR && (
        <div className="anim-up">
          <div className="flex gap-4">
            {/* Calendar grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => {
                  if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
                  else setViewMonth(m => m-1);
                }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-all active:scale-90 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide flex-1 text-center">
                  {MONTHS[viewMonth]} {viewYear}
                </h2>
                <button onClick={() => {
                  if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
                  else setViewMonth(m => m+1);
                }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-all active:scale-90 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DOW.map(d => (
                  <div key={d} className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calDays.map((day, i) => {
                  if (!day) return <div key={`e${i}`} className="min-h-[76px]" />;
                  const ds = toDS(day);
                  const has = datesSet.has(ds);
                  const isToday = ds === todayStr;
                  const lessons = schedulesByDate[ds] || [];

                  return (
                    <div key={ds} onClick={() => handleDateClick(ds)}
                      className={`day-cell min-h-[76px] rounded-2xl flex flex-col items-center justify-start pt-3 pb-2 px-1 select-none relative overflow-hidden
                        ${has ? "cursor-pointer" : "opacity-35 cursor-default"}
                        ${has
                          ? isToday
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 hover:shadow-lg hover:shadow-emerald-200/50"
                            : "bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100/50"
                          : "bg-gray-50/60 border border-gray-100"
                        }`}
                    >
                      <span className={`text-2xl font-black leading-none ${isToday ? "text-emerald-600" : has ? "text-gray-800" : "text-gray-300"}`}>
                        {day.getDate()}
                      </span>
                      {has && (
                        <div className="flex gap-0.5 mt-1.5">
                          {lessons.slice(0, 4).map((_, li) => (
                            <span key={li} className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-emerald-500 anim-pulse2" : "bg-emerald-400"}`} />
                          ))}
                        </div>
                      )}
                      {isToday && (
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">сегодня</span>
                      )}
                      {has && <div className="absolute inset-0 anim-shimmer rounded-2xl pointer-events-none" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month sidebar */}
            <div className="w-20 shrink-0 flex flex-col gap-1 pt-12">
              {MONTHS_SHORT.map((m, mi) => {
                const isActive = mi === viewMonth;
                const hasSch = schedules.some(s => {
                  // Regular (no date) schedules appear in every month
                  if (!s.date) return !!s.day;
                  const d = new Date(s.date + "T12:00:00");
                  return d.getMonth() === mi && d.getFullYear() === viewYear;
                });
                return (
                  <button key={m} onClick={() => { setViewMonth(mi); setSelectedDate(null); }}
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition-all text-left
                      ${isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50"
                        : hasSch ? "text-emerald-700 hover:bg-emerald-50 font-black" : "text-gray-400 hover:bg-gray-50"
                      }`}>
                    <span className="flex items-center gap-1">
                      {hasSch && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                      {m}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ SCHEDULE VIEW ═══════════════════ */}
      {view === VIEW_SCHEDULE && selectedDate && (
        <div className="anim-up">
          <button onClick={goBack}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 mb-5 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад к календарю
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <span className="text-2xl font-black text-white">{parseInt(selectedDate.split("-")[2])}</span>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("ru-RU", { weekday:"long", month:"long", day:"numeric" })}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{dayLessons.length} {dayLessons.length === 1 ? "пара" : "пары"}</p>
            </div>
          </div>

          <div className="space-y-3">
            {dayLessons.map((sch, idx) => (
              <div key={sch.id} className="anim-right" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                <div onClick={() => handleLessonClick(sch)}
                  className="lesson-card flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 cursor-pointer group shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:from-emerald-500 group-hover:to-teal-600 flex flex-col items-center justify-center shrink-0 transition-all duration-300">
                    {sch.lesson_order ? (
                      <>
                        <span className="text-[9px] font-black uppercase text-emerald-400 group-hover:text-emerald-200 transition-colors">№</span>
                        <span className="text-lg font-black text-emerald-600 group-hover:text-white leading-none transition-colors">{sch.lesson_order}</span>
                      </>
                    ) : (
                      <BookOpen className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-lg truncate">{sch.course_title || "Курс"}</p>
                    <div className="flex items-center flex-wrap gap-3 mt-1.5">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {sch.start_time} – {sch.end_time}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 group-hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors">
                        <Users className="w-3 h-3" />
                        {sch.group_name || `Группа #${sch.group}`}
                      </span>
                      {sch.room && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3 h-3" />
                          {sch.room}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 group-hover:text-emerald-700 shrink-0">
                    <span className="hidden sm:inline">Посещаемость</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ ATTENDANCE VIEW ═══════════════════ */}
      {view === VIEW_ATTENDANCE && selectedLesson && (
        <div className="anim-up">
          <button onClick={goBack}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 mb-5 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Назад к расписанию
          </button>

          {/* Lesson header */}
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6 shadow-xl shadow-emerald-200/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">{selectedLesson.course_title || "Курс"}</h3>
                <div className="flex items-center gap-3 mt-2 text-emerald-100 text-sm">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedLesson.start_time} – {selectedLesson.end_time}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selectedLesson.group_name}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(selectedDate+"T12:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</span>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Stats bar */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-emerald-600 font-bold">{presentCount} присутствует</span>
                    <span className="text-rose-500 font-bold">{students.length - presentCount} отсутствует</span>
                  </div>
                  <span className={`text-2xl font-black ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-500" : "text-rose-500"}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => markAll(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">✓ Все присутствуют</button>
                  <button onClick={() => markAll(false)} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">✗ Все отсутствуют</button>
                </div>
              </div>

              {/* Search */}
              <div className="px-5 py-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Поиск студента..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
              </div>

              {/* Student list */}
              <div className="divide-y divide-gray-100 max-h-[55vh] overflow-y-auto">
                {filteredStudents.map((s, idx) => {
                  const present = attendance[s.id] || false;
                  const u = s.student || {};
                  const name = `${u.first_name||""} ${u.last_name||""}`.trim() || u.username || `#${s.id}`;
                  const init = name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase();

                  return (
                    <div key={s.id} onClick={() => toggle(s.id)}
                      className={`student-row flex items-center justify-between px-5 py-3.5 cursor-pointer select-none
                        ${present ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-3.5">
                        <span className="text-xs text-gray-300 font-bold w-5 text-center">{idx + 1}</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300
                          ${present ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50" : "bg-gray-100 text-gray-500"}`}>
                          {init}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{name}</p>
                          <p className="text-xs text-gray-400">{u.username || ""}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300
                        ${present ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {present ? <><CheckCircle className="w-3.5 h-3.5" /> Был</> : <><XCircle className="w-3.5 h-3.5" /> Не был</>}
                      </div>
                    </div>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm font-bold">Не найдено</div>
                )}
              </div>

              {/* Footer save */}
              {students.length > 0 && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200/50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Сохранить посещаемость
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherCalendarAttendance;
