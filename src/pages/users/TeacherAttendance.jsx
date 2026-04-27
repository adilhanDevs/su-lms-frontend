import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

const TeacherAttendance = () => {
  const { allocationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allocation, setAllocation] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  // Дни недели для фильтрации
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Загрузка данных allocation
  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        // Получаем все allocation'ы учителя
        const res = await api.get(`/api/teacher-allocations/`);
        console.log("All allocations:", res.data);

        // Находим нужный allocation по ID
        const allAllocations = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        const foundAllocation = allAllocations.find(
          (a) => a.id === parseInt(allocationId)
        );

        if (!foundAllocation) {
          console.error("Allocation not found:", allocationId);
          alert("Назначение не найдено");
          navigate(-1);
          return;
        }

        console.log("Found allocation:", foundAllocation);
        setAllocation(foundAllocation);

        // Загружаем расписание для этой группы и курсов
        // courses_details содержит объекты с id курсов
        const courseIds = foundAllocation.courses?.map((c) => c.id) || [];

        console.log("Extracted course IDs:", courseIds);
        console.log("Group ID:", foundAllocation.group_id);

        if (!foundAllocation.group_id) {
          console.error("❌ Group ID is missing in allocation");
          alert("Ошибка: группа не указана в назначении");
          return;
        }

        if (courseIds.length === 0) {
          console.error("❌ No courses found in allocation");
          alert("Ошибка: курсы не указаны в назначении");
          return;
        }

        if (foundAllocation.group_id && courseIds.length > 0) {
          await fetchSchedules(foundAllocation.group_id, courseIds);
        }
      } catch (error) {
        console.error("Error loading allocation:", error);
        alert(`Ошибка загрузки данных: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocation();
  }, [allocationId, navigate]);

  // Загрузка расписания
  const fetchSchedules = async (groupId, courseIds) => {
    try {
      console.log(
        "Fetching schedules for group:",
        groupId,
        "courseIds:",
        courseIds
      );

      const res = await api.get(`attendance/schedules/`, {
        params: { group: groupId },
      });

      console.log("Schedules response:", res.data);

      // Обработка pagination
      const allSchedules = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      console.log("All schedules:", allSchedules);

      // Фильтруем только курсы преподавателя
      const filteredSchedules = allSchedules.filter((schedule) => {
        console.log(
          `Checking schedule ${schedule.id}: course=${
            schedule.course
          }, includes=${courseIds.includes(schedule.course)}`
        );
        return courseIds.includes(schedule.course);
      });

      console.log("Filtered schedules:", filteredSchedules);
      setSchedules(filteredSchedules);

      if (filteredSchedules.length === 0) {
        console.warn("⚠️ No schedules found for this teacher's courses");
        console.warn("Available course IDs in allocation:", courseIds);
        console.warn(
          "Course IDs in schedules:",
          allSchedules.map((s) => s.course)
        );
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  // Загрузка студентов группы и их посещаемость
  const fetchStudentsAndAttendance = async (scheduleId) => {
    try {
      setLoading(true);

      // Используем group для получения студентов
      if (!allocation.group) {
        console.error("Group not found in allocation");
        return;
      }

      // Загружаем студентов группы по имени группы
      const studentsRes = await api.get(
        `accounts/students/by-group/${allocation.group_id}/`
      );
      console.log("Students loaded:", studentsRes.data);

      // API возвращает массив объектов с вложенным полем student
      const studentsData = studentsRes.data.students || studentsRes.data || [];
      setStudents(studentsData);

      // Загружаем существующую посещаемость для этого занятия
      const attendanceRes = await api.get(`attendance/attendances/`, {
        params: { shcedule: scheduleId },
      });
      console.log("Attendance loaded:", attendanceRes.data);

      // Создаем объект с посещаемостью
      const attendanceMap = {};
      const attendanceList = Array.isArray(attendanceRes.data)
        ? attendanceRes.data
        : attendanceRes.data.results || [];

      attendanceList.forEach((record) => {
        attendanceMap[record.student] = record.status;
      });

      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error("Error loading students and attendance:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик выбора занятия
  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    fetchStudentsAndAttendance(schedule.id);
  };

  // Изменение статуса посещаемости
  const toggleAttendance = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Сохранение посещаемости
  const handleSaveAttendance = async () => {
    if (!selectedSchedule) return;

    setSaving(true);
    try {
      // Формируем данные для bulk update
      const attendances = students.map((studentData) => ({
        student_id: studentData.id,
        status: attendanceData[studentData.id] || false,
      }));

      await api.post(`attendance/attendances/bulk_update/`, {
        schedule_id: selectedSchedule.id,
        attendances,
      });

      alert("Посещаемость успешно сохранена!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Ошибка при сохранении посещаемости");
    } finally {
      setSaving(false);
    }
  };

  // Группировка расписания по дням
  const schedulesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading && !allocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Назад к дашборду
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Управление посещаемостью
          </h1>
          {allocation && (
            <p className="text-gray-600">Группа: {allocation.group}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая панель - Расписание */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Расписание занятий</h2>

              {schedules.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 font-medium mb-2">
                    ⚠️ Расписание не найдено
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Возможные причины:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Расписание еще не создано для этой группы</li>
                    <li>
                      Курсы в allocation не совпадают с курсами в расписании
                    </li>
                    <li>Группа не совпадает</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    Проверьте консоль браузера (F12) для деталей
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {daysOfWeek.map(
                    (day) =>
                      schedulesByDay[day].length > 0 && (
                        <div key={day} className="border-b pb-4">
                          <h3 className="font-semibold text-gray-700 mb-2">
                            {day}
                          </h3>
                          <div className="space-y-2">
                            {schedulesByDay[day].map((schedule) => (
                              <button
                                key={schedule.id}
                                onClick={() => handleScheduleSelect(schedule)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                  selectedSchedule?.id === schedule.id
                                    ? "bg-blue-100 border-2 border-blue-500"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                              >
                                <div className="font-medium text-sm">
                                  {schedule.course_title}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {schedule.start_time} - {schedule.end_time}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Правая панель - Список студентов */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {!selectedSchedule ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">📅</div>
                  <p>Выберите занятие из расписания слева</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedSchedule.course_title}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {selectedSchedule.day}, {selectedSchedule.start} -{" "}
                        {selectedSchedule.end}
                      </p>
                    </div>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={saving}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        saving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white transition-colors`}
                    >
                      {saving ? "Сохранение..." : "Сохранить"}
                    </button>
                  </div>

                  {/* Статистика */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {students.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Всего студентов
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(attendanceData).filter(Boolean).length}
                      </div>
                      <div className="text-sm text-gray-600">Присутствуют</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {students.length -
                          Object.values(attendanceData).filter(Boolean).length}
                      </div>
                      <div className="text-sm text-gray-600">Отсутствуют</div>
                    </div>
                  </div>

                  {/* Список студентов */}
                  {loading ? (
                    <div className="text-center py-8">
                      Загрузка студентов...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Студенты не найдены
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((studentData) => {
                        const student = studentData.student;
                        return (
                          <div
                            key={studentData.id}
                            onClick={() => toggleAttendance(studentData.id)}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                              attendanceData[studentData.id]
                                ? "bg-green-50 border-2 border-green-500"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                  attendanceData[studentData.id]
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              >
                                {student.first_name?.[0]?.toUpperCase() || "?"}
                                {student.last_name?.[0]?.toUpperCase() || ""}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {student.first_name} {student.last_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-2xl ${
                                attendanceData[studentData.id]
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {attendanceData[studentData.id] ? "✓" : "○"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
