import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, ArrowLeft, ChevronLeft, ChevronRight,
  Clock, BookOpen, Users, Loader2
} from "lucide-react";
import api from "../../../api";
import TeacherCalendarAttendance from "./TeacherCalendarAttendance";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DOW = ["Mo","Tu","We","Th","Fr","Sa","Su"];

const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const todayStr = toDateStr(new Date());

export const WallCalendar = ({ schedules, allocations }) => {
  const navigate = useNavigate();

  const [viewYear,      setViewYear]      = useState(() => new Date().getFullYear());
  const [viewMonth,     setViewMonth]     = useState(() => new Date().getMonth());
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [justPopped,    setJustPopped]    = useState(null);
  const [panelVisible,  setPanelVisible]  = useState(false);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const map = {};
    schedules.forEach(s => {
      if (s.date) (map[s.date] ??= []).push(s);
    });
    return map;
  }, [schedules]);

  const datesWithLesson = useMemo(() => new Set(Object.keys(schedulesByDate)), [schedulesByDate]);

  // Calendar grid cells for current month
  const calendarDays = useMemo(() => {
    let startDow = new Date(viewYear, viewMonth, 1).getDay() - 1;
    if (startDow < 0) startDow = 6;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = Array(startDow).fill(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  // Find allocationId for a schedule item
  const getAllocationId = useCallback((sch) => {
    const alloc = (allocations || []).find(
      a => a.group === sch.group && (a.courses || []).includes(sch.course)
    );
    return alloc?.id;
  }, [allocations]);

  const handleSelectDate = (ds) => {
    if (!datesWithLesson.has(ds)) return;
    setJustPopped(ds);
    setTimeout(() => setJustPopped(null), 420);
    if (selectedDate === ds) {
      setSelectedDate(null);
      setPanelVisible(false);
    } else {
      setSelectedDate(ds);
      setPanelVisible(false);
      setTimeout(() => setPanelVisible(true), 20);
    }
  };

  const dayLessons = selectedDate ? (schedulesByDate[selectedDate] || []) : [];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div>
      <style>{`
        @keyframes calSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes calPop {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.5) translateY(-6px); }
          100% { transform: scale(1); }
        }
        .cal-slide-down { animation: calSlideDown 0.32s cubic-bezier(.16,1,.3,1) forwards; }
        .cal-pop        { animation: calPop 0.38s cubic-bezier(.4,2.2,.6,1) forwards; }
      `}</style>

      <div className="flex gap-4">
        {/* ── Main calendar ── */}
        <div className="flex-1 min-w-0">
          {/* Month header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-all active:scale-90">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide flex-1 text-center">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-all active:scale-90">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* DOW header row */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => (
              <div key={d}
                className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells — wall-calendar style */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="min-h-[72px]" />;

              const ds         = toDateStr(day);
              const hasLesson  = datesWithLesson.has(ds);
              const isToday    = ds === todayStr;
              const isSelected = ds === selectedDate;
              const isPopping  = ds === justPopped;
              const lessons    = schedulesByDate[ds] || [];

              return (
                <div key={ds}
                  onClick={() => handleSelectDate(ds)}
                  className={`
                    min-h-[72px] rounded-2xl flex flex-col items-center justify-start pt-3 pb-2 px-1
                    select-none transition-all duration-200 relative overflow-hidden
                    ${hasLesson
                      ? "cursor-pointer"
                      : "opacity-40 cursor-default"
                    }
                    ${isSelected
                      ? "bg-green-600 shadow-lg shadow-green-300/50"
                      : hasLesson
                        ? isToday
                          ? "bg-green-50 border-2 border-green-400 hover:bg-green-100"
                          : "bg-gray-50 border border-gray-200 hover:border-green-300 hover:bg-green-50/60"
                        : "bg-gray-50/60 border border-gray-100"
                    }
                  `}
                >
                  {/* Day number */}
                  <span className={`
                    text-2xl font-black leading-none transition-all
                    ${isPopping ? "cal-pop inline-block" : ""}
                    ${isSelected
                      ? "text-white"
                      : isToday
                        ? "text-green-600"
                        : "text-gray-800"
                    }
                  `}>
                    {day.getDate()}
                  </span>

                  {/* Lesson count chips */}
                  {hasLesson && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1.5 px-1">
                      {lessons.slice(0, 3).map((l, li) => (
                        <span key={li} className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-green-200" : "bg-green-500"
                        }`} />
                      ))}
                    </div>
                  )}

                  {/* "Today" label */}
                  {isToday && !isSelected && (
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">
                      today
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Selected day lessons panel ── */}
          {selectedDate && panelVisible && (
            <div className="mt-5 cal-slide-down">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-sm shadow-green-200 shrink-0">
                  <span className="text-lg font-black text-white leading-none">
                    {parseInt(selectedDate.split("-")[2])}
                  </span>
                </div>
                <div>
                  <p className="font-black text-gray-900">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                  </p>
                  <p className="text-xs text-gray-400">{dayLessons.length} lesson{dayLessons.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="space-y-2">
                {dayLessons.map((sch, idx) => {
                  const allocId = getAllocationId(sch);
                  const card = (
                    <div className={`
                      flex items-center gap-4 p-4 rounded-2xl border transition-all
                      ${allocId
                        ? "bg-white border-gray-200 hover:border-green-300 hover:shadow-md cursor-pointer group"
                        : "bg-gray-50 border-gray-200 opacity-70"}
                    `}>
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors ${
                        allocId
                          ? "bg-green-50 group-hover:bg-green-600"
                          : "bg-gray-100"
                      }`}>
                        {sch.lesson_order ? (
                          <>
                            <span className={`text-[9px] font-black uppercase tracking-wide ${allocId ? "text-green-400 group-hover:text-green-200" : "text-gray-400"} transition-colors`}>
                              No.
                            </span>
                            <span className={`text-lg font-black leading-none ${allocId ? "text-green-600 group-hover:text-white" : "text-gray-500"} transition-colors`}>
                              {sch.lesson_order}
                            </span>
                          </>
                        ) : (
                          <BookOpen className={`w-5 h-5 ${allocId ? "text-green-600 group-hover:text-white" : "text-gray-400"} transition-colors`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate">{sch.course_title}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {sch.start_time} – {sch.end_time}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 group-hover:bg-green-50 px-2 py-0.5 rounded-lg transition-colors">
                            <Users className="w-3 h-3" />
                            {sch.group_name || `Group #${sch.group}`}
                          </span>
                        </div>
                      </div>

                      {allocId && (
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 group-hover:text-green-700 shrink-0">
                          Attendance
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      )}
                    </div>
                  );

                  return allocId ? (
                    <Link key={sch.id} to={`/teacher/attendance/${allocId}`}>{card}</Link>
                  ) : (
                    <div key={sch.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: months sidebar ── */}
        <div className="w-20 shrink-0 flex flex-col gap-1 pt-12">
          {MONTHS.map((m, mi) => {
            const isActive = mi === viewMonth && viewYear === new Date().getFullYear()
              ? true : mi === viewMonth;
            const hasSomething = schedules.some(s => {
              if (!s.date) return false;
              const d = new Date(s.date + "T12:00:00");
              return d.getMonth() === mi && d.getFullYear() === viewYear;
            });
            return (
              <button key={m}
                onClick={() => { setViewMonth(mi); setSelectedDate(null); setPanelVisible(false); }}
                className={`
                  w-full py-2 px-2 rounded-xl text-xs font-bold transition-all text-left
                  ${isActive
                    ? "bg-green-600 text-white shadow-sm shadow-green-200"
                    : hasSomething
                      ? "text-green-700 hover:bg-green-50 font-black"
                      : "text-gray-400 hover:bg-gray-50"
                  }
                `}
              >
                <span className="flex items-center gap-1">
                  {hasSomething && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  )}
                  {m.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Standalone page ──────────────────────────────────────────────────────
const TeacherSchedule = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">My Schedule</h1>
            <p className="text-sm text-gray-500">Click a highlighted date to see your lessons</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <TeacherCalendarAttendance />
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;
