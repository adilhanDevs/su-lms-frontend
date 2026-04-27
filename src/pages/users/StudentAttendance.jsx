import React, { useState, useEffect } from "react";
import api from "../../api";

const StudentAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [mySchedule, setMySchedule] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedDay, setSelectedDay] = useState("All");

  const daysOfWeek = [
    "All",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Загружаем расписание студента
      const scheduleRes = await api.get("attendance/schedules/my_schedule/");
      setMySchedule(scheduleRes.data);

      // Загружаем посещаемость студента
      const attendanceRes = await api.get(
        "attendance/attendances/my_attendance/"
      );
      setMyAttendance(attendanceRes.data);

      // Загружаем статистику
      const statsRes = await api.get("attendance/attendances/statistics/");
      setStatistics(statsRes.data);
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Получить статус посещаемости для конкретного занятия
  const getAttendanceStatus = (scheduleId) => {
    const record = myAttendance.find((a) => a.shcedule === scheduleId);
    return record ? record.status : null;
  };

  // Фильтрация расписания по дню
  const filteredSchedule =
    selectedDay === "All"
      ? mySchedule
      : mySchedule.filter((s) => s.day === selectedDay);

  // Группировка по дням для отображения
  const scheduleByDay = daysOfWeek.slice(1).reduce((acc, day) => {
    acc[day] = mySchedule.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Моя посещаемость
          </h1>
          <p className="text-gray-600">
            Отслеживайте свое расписание и посещаемость занятий
          </p>
        </div>

        {/* Статистика */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {statistics.total}
              </div>
              <div className="text-gray-600">Всего занятий</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {statistics.present}
              </div>
              <div className="text-gray-600">Присутствовал</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {statistics.absent}
              </div>
              <div className="text-gray-600">Отсутствовал</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {statistics.attendance_rate}%
              </div>
              <div className="text-gray-600">Посещаемость</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${statistics.attendance_rate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Фильтр по дням */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Расписание */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Расписание занятий</h2>

          {selectedDay === "All" ? (
            // Показываем по дням
            <div className="space-y-6">
              {daysOfWeek.slice(1).map(
                (day) =>
                  scheduleByDay[day].length > 0 && (
                    <div key={day}>
                      <h3 className="font-semibold text-lg text-gray-700 mb-3 border-b pb-2">
                        {day}
                      </h3>
                      <div className="grid gap-4">
                        {scheduleByDay[day].map((schedule) => {
                          const attendanceStatus = getAttendanceStatus(
                            schedule.id
                          );
                          return (
                            <div
                              key={schedule.id}
                              className={`p-4 rounded-lg border-2 ${
                                attendanceStatus === true
                                  ? "border-green-500 bg-green-50"
                                  : attendanceStatus === false
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {schedule.course_title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {schedule.course_code}
                                  </p>
                                  {schedule.lecturer_name && (
                                    <p className="text-sm text-gray-600">
                                      Преподаватель: {schedule.lecturer_name}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-700">
                                    {schedule.start} - {schedule.end}
                                  </div>
                                  {attendanceStatus !== null && (
                                    <div
                                      className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                                        attendanceStatus
                                          ? "bg-green-200 text-green-800"
                                          : "bg-red-200 text-red-800"
                                      }`}
                                    >
                                      {attendanceStatus
                                        ? "✓ Присутствовал"
                                        : "✗ Отсутствовал"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            // Показываем выбранный день
            <div className="grid gap-4">
              {filteredSchedule.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  В этот день нет занятий
                </div>
              ) : (
                filteredSchedule.map((schedule) => {
                  const attendanceStatus = getAttendanceStatus(schedule.id);
                  return (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border-2 ${
                        attendanceStatus === true
                          ? "border-green-500 bg-green-50"
                          : attendanceStatus === false
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {schedule.course_title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {schedule.course_code}
                          </p>
                          {schedule.lecturer_name && (
                            <p className="text-sm text-gray-600">
                              Преподаватель: {schedule.lecturer_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-700">
                            {schedule.start} - {schedule.end}
                          </div>
                          {attendanceStatus !== null && (
                            <div
                              className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                                attendanceStatus
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {attendanceStatus
                                ? "✓ Присутствовал"
                                : "✗ Отсутствовал"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* История посещаемости */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">История посещаемости</h2>
          {myAttendance.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              История посещаемости пока пуста
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Курс</th>
                    <th className="text-left py-3 px-4">День</th>
                    <th className="text-left py-3 px-4">Время</th>
                    <th className="text-center py-3 px-4">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.course_title}</div>
                        <div className="text-sm text-gray-600">
                          {record.course_code}
                        </div>
                      </td>
                      <td className="py-3 px-4">{record.schedule_day}</td>
                      <td className="py-3 px-4">{record.schedule_time}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            record.status
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {record.status ? "✓ Присутствовал" : "✗ Отсутствовал"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
