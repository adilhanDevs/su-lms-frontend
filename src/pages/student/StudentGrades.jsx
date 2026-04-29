import React, { useEffect, useState } from "react";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Award } from "lucide-react";

const getGradeColor = (g) => {
  if (["A+", "A", "A-"].includes(g)) return "bg-emerald-100 text-emerald-800";
  if (["B+", "B", "B-"].includes(g)) return "bg-blue-100 text-blue-800";
  if (["C+", "C", "C-"].includes(g)) return "bg-yellow-100 text-yellow-800";
  if (["D", "F"].includes(g)) return "bg-rose-100 text-rose-800";
  return "bg-gray-100 text-gray-800";
};

export default function StudentGrades() {
  const [grades, setGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("result/api/grade-semesters/my_all_grades/");
        setGrades(r.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell title="Full Transcript" subtitle="All your academic grades">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-8">
          <Section title="Semester Grades" items={grades.semester_grades} showSemester />
          <Section title="First Module" items={grades.first_module_grades} />
          <Section title="Second Module" items={grades.second_module_grades} />
        </div>
      )}
    </PageShell>
  );
}

const Section = ({ title, items, showSemester = false }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <Award className="w-5 h-5 text-blue-600" />
      <h3 className="font-bold text-gray-900">{title}</h3>
      <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
        {items.length}
      </span>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-gray-500 p-6">No grades yet.</p>
    ) : (
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Course",
              "Lecturer",
              showSemester && "Semester",
              "Attendance",
              "Activities",
              "Exam",
              "Total",
              "Grade",
            ]
              .filter(Boolean)
              .map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((g) => (
            <tr key={g.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{g.course_title}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{g.lecturer_name}</td>
              {showSemester && (
                <td className="px-4 py-3 text-sm text-gray-700">{g.semester_name}</td>
              )}
              <td className="px-4 py-3 text-sm text-gray-700">{g.attendance}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{g.activities}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{g.exam}</td>
              <td className="px-4 py-3 font-bold text-gray-900">{g.total}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${getGradeColor(g.grade)}`}
                >
                  {g.grade || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
