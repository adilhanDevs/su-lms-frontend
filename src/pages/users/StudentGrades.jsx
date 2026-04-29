import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, ArrowLeft, Zap } from "lucide-react";
import api from "../../api";

const getGradeColor = (grade) => {
  const map = {
    "A+": "bg-emerald-500 text-white",
    A: "bg-emerald-400 text-white",
    "A-": "bg-emerald-300 text-emerald-900",
    "B+": "bg-blue-400 text-white",
    B: "bg-blue-300 text-blue-900",
    "B-": "bg-blue-200 text-blue-900",
    "C+": "bg-yellow-300 text-yellow-900",
    C: "bg-yellow-400 text-yellow-900",
    "C-": "bg-yellow-500 text-yellow-900",
    D: "bg-orange-400 text-orange-900",
    F: "bg-red-500 text-white",
  };
  return map[grade] || "bg-gray-200 text-gray-900";
};

const getGradeBadgeColor = (grade) => {
  if (["A+", "A", "A-"].includes(grade)) return "bg-emerald-100 text-emerald-800";
  if (["B+", "B", "B-"].includes(grade)) return "bg-blue-100 text-blue-800";
  if (["C+", "C", "C-"].includes(grade)) return "bg-yellow-100 text-yellow-800";
  if (["D", "F"].includes(grade)) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const Stat = ({ label, value, highlight }) => (
  <div className={`rounded-xl p-3 ${highlight ? "bg-blue-50" : "bg-gray-50"}`}>
    <p className={`text-xs mb-1 ${highlight ? "text-blue-600" : "text-gray-600"}`}>
      {label}
    </p>
    <p className={`font-semibold ${highlight ? "text-blue-700" : "text-gray-900"}`}>
      {value}
    </p>
  </div>
);

const ModuleColumn = ({ title, items, accent }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${accent}`}>
      <Zap className="w-5 h-5" />
      {title}
    </h4>
    {items.length === 0 ? (
      <div className="text-center py-6 bg-gray-50 rounded-2xl">
        <p className="text-gray-600">No grades</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((g) => (
          <div key={g.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{g.course_title}</p>
                <p className="text-sm text-gray-600">Total: {g.total}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg font-bold ${getGradeBadgeColor(g.grade)}`}
              >
                {g.grade}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StudentGrades = () => {
  const [grades, setGrades] = useState({
    first_module_grades: [],
    second_module_grades: [],
    semester_grades: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get("result/api/grade-semesters/my_all_grades/");
        setGrades(res.data);
      } catch (e) {
        console.error("grades error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" /> Full Transcript
            </h1>
            <p className="text-gray-600">Detailed view of your academic grades</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Semester Grades
              </h4>
              {grades.semester_grades.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl">
                  <p className="text-gray-600">No semester grades yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grades.semester_grades.map((g) => (
                    <div
                      key={g.id}
                      className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="text-lg font-bold text-gray-900">{g.course_title}</h5>
                          <p className="text-sm text-gray-600">
                            {g.course_code && (
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                {g.course_code}
                              </span>
                            )}{" "}
                            Lecturer: {g.lecturer_name}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <Stat label="Attendance" value={g.attendance} />
                            <Stat label="Activities" value={g.activities} />
                            <Stat label="Exam" value={g.exam} />
                            <Stat label="Total" value={g.total} highlight />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`px-6 py-3 rounded-xl font-bold text-xl ${getGradeColor(g.grade)}`}>
                            {g.grade}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeBadgeColor(
                              g.grade
                            )}`}
                          >
                            {g.semester_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleColumn
                title="First Module"
                items={grades.first_module_grades}
                accent="text-blue-600"
              />
              <ModuleColumn
                title="Second Module"
                items={grades.second_module_grades}
                accent="text-purple-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
