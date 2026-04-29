import React, { useState, useEffect } from "react";
import api from "../../api";
import * as XLSX from "xlsx";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Bell,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileSpreadsheet,
  Printer,
} from "lucide-react";

const AdminSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lessonTimes, setLessonTimes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [formData, setFormData] = useState({
    course: "",
    group: "",
    lesson_time: "",
    day: "Monday",
    date: "",
    room: "",
  });

  const daysOfWeek = [
    { id: "Monday", label: "Понедельник" },
    { id: "Tuesday", label: "Вторник" },
    { id: "Wednesday", label: "Среда" },
    { id: "Thursday", label: "Четверг" },
    { id: "Friday", label: "Пятница" },
  ];

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return {
      id: i + 1,
      start: `${hour}:00`,
      end: `${hour + 1}:00`,
      label: `${hour}:00 - ${hour + 1}:00`,
    };
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, coursesRes, groupsRes, lessonTimesRes] =
        await Promise.all([
          api.get("/attendance/schedules/"),
          api.get("/api/courses/"),
          api.get("/accounts/groups/"),
          api.get("/attendance/lesson-times/"),
        ]);

      console.log("Data loaded:", {
        schedules: schedulesRes.data,
        courses: coursesRes.data,
        groups: groupsRes.data,
        lessonTimes: lessonTimesRes.data,
      });

      setSchedules(schedulesRes.data || []);
      setCourses(
        Array.isArray(coursesRes.data)
          ? coursesRes.data
          : coursesRes.data?.results || []
      );
      setGroups(
        Array.isArray(groupsRes.data)
          ? groupsRes.data
          : groupsRes.data?.results || []
      );
      setLessonTimes(
        Array.isArray(lessonTimesRes.data)
          ? lessonTimesRes.data
          : lessonTimesRes.data?.results || []
      );
    } catch (error) {
      console.error("Error loading data:", error);
      alert(
        `Ошибка загрузки данных: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (
    schedule = null,
    day = null,
    timeSlot = null,
    group = null
  ) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        course: schedule.course,
        group: schedule.group,
        lesson_time: schedule.lesson_time || "",
        day: schedule.day,
        date: schedule.date || "",
        room: schedule.room || "",
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        course: "",
        group: group || "",
        lesson_time: timeSlot?.id || "",
        day: day || selectedDay,
        date: "",
        room: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        course: parseInt(formData.course),
        group: parseInt(formData.group),
        day: formData.day,
      };

      if (formData.lesson_time) {
        data.lesson_time = parseInt(formData.lesson_time);
      }

      if (formData.date) {
        data.date = formData.date;
      }

      if (formData.room) {
        data.room = formData.room;
      }

      console.log("Submitting schedule data:", data);

      if (editingSchedule) {
        await api.put(`/attendance/schedules/${editingSchedule.id}/`, data);
        alert("Расписание успешно обновлено!");
      } else {
        await api.post("/attendance/schedules/", data);
        alert("Расписание успешно создано!");
      }

      handleCloseModal();
      fetchAllData();
    } catch (error) {
      console.error("Error saving schedule:", error);
      let errorMessage = "Ошибка при сохранении расписания";
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === "object") {
          errorMessage +=
            ":\n" +
            Object.entries(errors)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
              )
              .join("\n");
        } else {
          errorMessage += `: ${errors}`;
        }
      }
      alert(errorMessage);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это занятие?")) {
      return;
    }

    try {
      await api.delete(`/attendance/schedules/${scheduleId}/`);
      alert("Расписание успешно удалено!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert(
        `Ошибка при удалении расписания: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
  };

  // Функция для получения расписания для конкретного дня, времени и группы
  const getScheduleForSlot = (day, timeSlotId, groupId) => {
    return schedules.find(
      (schedule) =>
        schedule.day === day &&
        schedule.lesson_time === timeSlotId &&
        schedule.group === groupId
    );
  };

  // Получаем отсортированные временные слоты
  const getSortedLessonTimes = () => {
    return [...lessonTimes].sort((a, b) => a.order - b.order);
  };

  // Функция для подготовки данных для экспорта в Excel
  const prepareExportData = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const sortedTimes = getSortedLessonTimes();

    // Создаем массив для данных Excel
    const excelData = [];

    // Добавляем заголовок
    excelData.push(["РАСПИСАНИЕ ЗАНЯТИЙ", "", "", "", "", "", ""]);
    excelData.push([
      "Дата экспорта:",
      new Date().toLocaleDateString("ru-RU"),
      "",
      "",
      "",
      "",
      "",
    ]);
    excelData.push([]);

    // Для каждого дня создаем отдельный лист данных
    days.forEach((day) => {
      const dayLabel = daysOfWeek.find((d) => d.id === day)?.label || day;

      // Заголовок для дня
      excelData.push([`${dayLabel}`, "", "", "", "", "", ""]);
      excelData.push([]);

      // Заголовки таблицы - Примечания первым слева
      const headers = ["Примечания", "Время", ...groups.map((g) => g.name)];
      excelData.push(headers);

      // Данные для каждого временного слота
      sortedTimes.forEach((timeSlot) => {
        const row = [
          timeSlot.order ? `Урок ${timeSlot.order}` : "",
          `${timeSlot.start_time?.slice(0, 5) || "08:00"} - ${
            timeSlot.end_time?.slice(0, 5) || "09:00"
          }`,
        ];

        groups.forEach((group) => {
          const schedule = getScheduleForSlot(day, timeSlot.id, group.id);
          if (schedule) {
            const courseInfo = `${
              schedule.course_title || schedule.course_code || "Курс"
            }`;
            const lecturerInfo = schedule.lecturer_name
              ? `\nПреп: ${schedule.lecturer_name}`
              : "";
            const classroomInfo = schedule.classroom
              ? `\nАуд: ${schedule.classroom}`
              : "";
            row.push(`${courseInfo}${lecturerInfo}${classroomInfo}`);
          } else {
            row.push("");
          }
        });

        excelData.push(row);
      });

      // Пустая строка между днями
      excelData.push([]);
      excelData.push([]);
    });

    return excelData;
  };

  // Функция экспорта в Excel
  const exportToExcel = () => {
    try {
      // Подготавливаем данные
      const excelData = prepareExportData();

      // Создаем новую рабочую книгу
      const wb = XLSX.utils.book_new();

      // Создаем рабочий лист из данных
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Настраиваем ширину столбцов
      const colWidths = [];
      colWidths.push({ wch: 12 }); // Примечания
      colWidths.push({ wch: 15 }); // Время
      for (let i = 0; i < groups.length; i++) {
        colWidths.push({ wch: 25 }); // Группы
      }
      ws["!cols"] = colWidths;

      // Добавляем стили безопасным способом
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);

          // Проверяем существует ли ячейка
          if (!ws[cell_ref]) continue;

          // Инициализируем объект стилей если его нет
          if (!ws[cell_ref].s) {
            ws[cell_ref].s = {};
          }

          // Стиль для главного заголовка (строка 0)
          if (R === 0 && C === 0) {
            ws[cell_ref].s = {
              font: { bold: true, sz: 16 },
              alignment: { horizontal: "left", vertical: "center" },
            };
          }

          // Стиль для дней недели (заголовки дней)
          if (
            excelData[R] &&
            excelData[R][0] &&
            daysOfWeek.some((d) => excelData[R][0].includes(d.label))
          ) {
            ws[cell_ref].s = {
              font: { bold: true, sz: 14 },
              fill: { fgColor: { rgb: "E6F3FF" } },
              alignment: { horizontal: "left", vertical: "center" },
            };
          }

          // Стиль для заголовков столбцов (Примечания, Время, названия групп)
          if (
            R > 0 &&
            excelData[R] &&
            (excelData[R][0] === "Примечания" || excelData[R][1] === "Время")
          ) {
            ws[cell_ref].s = {
              font: { bold: true, sz: 11 },
              fill: { fgColor: { rgb: "F2F2F2" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              },
            };
          }
        }
      }

      // Добавляем рабочий лист в книгу
      XLSX.utils.book_append_sheet(wb, ws, "Расписание");

      // Генерируем файл и скачиваем
      const fileName = `Расписание_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`Расписание успешно экспортировано в файл: ${fileName}`);
    } catch (error) {
      console.error("Ошибка при экспорте в Excel:", error);
      alert("Ошибка при экспорте в Excel. Проверьте консоль для деталей.");
    }
  };

  // Функция для экспорта расписания конкретного дня
  const exportDayToExcel = (day) => {
    try {
      const dayLabel = daysOfWeek.find((d) => d.id === day)?.label || day;
      const sortedTimes = getSortedLessonTimes();

      // Подготавливаем данные для дня
      const excelData = [];

      // Заголовок
      excelData.push([
        `РАСПИСАНИЕ НА ${dayLabel.toUpperCase()}`,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      excelData.push([
        "Дата экспорта:",
        new Date().toLocaleDateString("ru-RU"),
        "",
        "",
        "",
        "",
        "",
      ]);
      excelData.push([]);

      // Заголовки таблицы - Примечания первым
      const headers = ["Примечания", "Время", ...groups.map((g) => g.name)];
      excelData.push(headers);

      // Данные
      sortedTimes.forEach((timeSlot) => {
        const row = [
          timeSlot.order ? `Урок ${timeSlot.order}` : "",
          `${timeSlot.start_time?.slice(0, 5) || "08:00"} - ${
            timeSlot.end_time?.slice(0, 5) || "09:00"
          }`,
        ];

        groups.forEach((group) => {
          const schedule = getScheduleForSlot(day, timeSlot.id, group.id);
          if (schedule) {
            const courseInfo = `${
              schedule.course_title || schedule.course_code || "Курс"
            }`;
            const lecturerInfo = schedule.lecturer_name
              ? `\nПреп: ${schedule.lecturer_name}`
              : "";
            const classroomInfo = schedule.classroom
              ? `\nАуд: ${schedule.classroom}`
              : "";
            row.push(`${courseInfo}${lecturerInfo}${classroomInfo}`);
          } else {
            row.push("");
          }
        });

        excelData.push(row);
      });

      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Настраиваем ширину столбцов
      const colWidths = [];
      colWidths.push({ wch: 12 }); // Примечания
      colWidths.push({ wch: 15 }); // Время
      for (let i = 0; i < groups.length; i++) {
        colWidths.push({ wch: 25 }); // Группы
      }
      ws["!cols"] = colWidths;

      // Добавляем стили безопасным способом
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);

          // Проверяем существует ли ячейка
          if (!ws[cell_ref]) continue;

          // Инициализируем объект стилей
          if (!ws[cell_ref].s) {
            ws[cell_ref].s = {};
          }

          // Стиль для главного заголовка
          if (R === 0 && C === 0) {
            ws[cell_ref].s = {
              font: { bold: true, sz: 16 },
              alignment: { horizontal: "left", vertical: "center" },
            };
          }

          // Стиль для заголовков столбцов
          if (R === 3) {
            ws[cell_ref].s = {
              font: { bold: true, sz: 11 },
              fill: { fgColor: { rgb: "E6F3FF" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              },
            };
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, dayLabel);

      // Сохраняем файл
      const fileName = `Расписание_${dayLabel}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`Расписание на ${dayLabel} успешно экспортировано!`);
    } catch (error) {
      console.error("Ошибка при экспорте дня в Excel:", error);
      alert("Ошибка при экспорте расписания дня.");
    }
  };

  // Функция для экспорта детального отчета
  const exportDetailedReport = () => {
    try {
      // Собираем все данные о занятиях
      const detailedData = schedules.map((schedule) => {
        const course = courses.find((c) => c.id === schedule.course);
        const group = groups.find((g) => g.id === schedule.group);
        const lessonTime = lessonTimes.find(
          (lt) => lt.id === schedule.lesson_time
        );
        const dayLabel =
          daysOfWeek.find((d) => d.id === schedule.day)?.label || schedule.day;

        return {
          "День недели": dayLabel,
          Дата: schedule.date
            ? new Date(schedule.date).toLocaleDateString("ru-RU")
            : "Регулярное",
          Время: lessonTime
            ? `${lessonTime.start_time?.slice(0, 5) || "08:00"} - ${
                lessonTime.end_time?.slice(0, 5) || "09:00"
              }`
            : "Не указано",
          "Номер урока": lessonTime?.order || "Не указан",
          Курс: course?.name || schedule.course_title || "Не указан",
          "Код курса": schedule.course_code || "Не указан",
          Группа: group?.name || "Не указана",
          Преподаватель: schedule.lecturer_name || "Не указан",
          Аудитория: schedule.classroom || "Не указана",
          Статус: "Активно",
        };
      });

      // Создаем рабочую книгу с несколькими листами
      const wb = XLSX.utils.book_new();

      // Лист 1: Детальный отчет
      const ws1 = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, ws1, "Детальный отчет");

      // Лист 2: Сводка по дням
      const summaryByDay = {};
      daysOfWeek.forEach((day) => {
        const daySchedules = schedules.filter((s) => s.day === day.id);
        summaryByDay[day.label] = daySchedules.length;
      });

      const summaryData = Object.entries(summaryByDay).map(([day, count]) => ({
        "День недели": day,
        "Количество занятий": count,
      }));

      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws2, "Сводка по дням");

      // Лист 3: Сводка по группам
      const summaryByGroup = {};
      groups.forEach((group) => {
        const groupSchedules = schedules.filter((s) => s.group === group.id);
        summaryByGroup[group.name] = groupSchedules.length;
      });

      const groupSummaryData = Object.entries(summaryByGroup).map(
        ([group, count]) => ({
          Группа: group,
          "Количество занятий": count,
        })
      );

      const ws3 = XLSX.utils.json_to_sheet(groupSummaryData);
      XLSX.utils.book_append_sheet(wb, ws3, "Сводка по группам");

      // Сохраняем файл
      const fileName = `Детальный_отчет_расписания_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`Детальный отчет успешно экспортирован!`);
    } catch (error) {
      console.error("Ошибка при экспорте детального отчета:", error);
      alert("Ошибка при экспорте детального отчета.");
    }
  };

  // Функция для печати расписания
  const printSchedule = () => {
    const printWindow = window.open("", "_blank");
    const dayLabel =
      daysOfWeek.find((d) => d.id === selectedDay)?.label || selectedDay;
    const sortedTimes = getSortedLessonTimes();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Расписание на ${dayLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; text-align: left; padding: 12px; border: 1px solid #ddd; }
          td { padding: 10px; border: 1px solid #ddd; vertical-align: top; }
          .time-cell { background-color: #f8f9fa; font-weight: bold; }
          .course-cell { background-color: #e6f7ff; }
          .empty-cell { background-color: #f9f9f9; color: #999; text-align: center; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .date { color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Расписание занятий</h1>
            <div class="date">Дата печати: ${new Date().toLocaleDateString(
              "ru-RU"
            )}</div>
          </div>
          <button class="no-print" onclick="window.print()">🖨️ Печать</button>
        </div>
        
        <h2>${dayLabel}</h2>
        
        <table>
          <thead>
            <tr>
              <th>Время</th>
              ${groups.map((group) => `<th>${group.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${sortedTimes
              .map(
                (timeSlot) => `
              <tr>
                <td class="time-cell">
                  ${timeSlot.start_time?.slice(0, 5) || "08:00"} - ${
                  timeSlot.end_time?.slice(0, 5) || "09:00"
                }<br>
                  <small>Урок ${timeSlot.order}</small>
                </td>
                ${groups
                  .map((group) => {
                    const schedule = getScheduleForSlot(
                      selectedDay,
                      timeSlot.id,
                      group.id
                    );
                    if (schedule) {
                      return `
                      <td class="course-cell">
                        <strong>${
                          schedule.course_title ||
                          schedule.course_code ||
                          "Курс"
                        }</strong><br>
                        ${
                          schedule.lecturer_name
                            ? `<small>Преп: ${schedule.lecturer_name}</small><br>`
                            : ""
                        }
                        ${
                          schedule.classroom
                            ? `<small>Ауд: ${schedule.classroom}</small>`
                            : ""
                        }
                      </td>
                    `;
                    }
                    return `<td class="empty-cell">Свободно</td>`;
                  })
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; font-size: 12px; color: #666;">
          <p>Всего занятий: ${
            schedules.filter((s) => s.day === selectedDay).length
          }</p>
          <p>Всего групп: ${groups.length}</p>
          <p>© Учебный портал ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка расписания...</p>
          <p className="text-sm text-gray-500 mt-2">
            Получение данных о курсах, группах и времени
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header с обновленными кнопками экспорта */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Расписание занятий
            </h1>
            <p className="text-gray-600 mt-1">
              Управление расписанием курсов для всех групп
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Обновить"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            {/* Меню экспорта с выпадающим списком */}
            <div className="relative group">
              <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2">
                <Download className="w-5 h-5" />
                Экспорт
                <ChevronRight className="w-4 h-4 transform rotate-90" />
              </button>

              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 hidden group-hover:block">
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Полное расписание
                    </div>
                    <div className="text-sm text-gray-500">
                      Excel файл со всеми днями
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => exportDayToExcel(selectedDay)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Текущий день
                    </div>
                    <div className="text-sm text-gray-500">
                      Только $
                      {daysOfWeek.find((d) => d.id === selectedDay)?.label}
                    </div>
                  </div>
                </button>

                <button
                  onClick={exportDetailedReport}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Детальный отчет
                    </div>
                    <div className="text-sm text-gray-500">
                      Подробная статистика
                    </div>
                  </div>
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={printSchedule}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <Printer className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Печать</div>
                    <div className="text-sm text-gray-500">
                      Версия для печати
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Обновленный Quick Actions с кнопкой печати */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Экспорт и печать</h2>
              <p className="text-blue-100">
                Сохраняйте и распечатывайте расписание в разных форматах
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Excel файл
              </button>
              <button
                onClick={printSchedule}
                className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Печать
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Всего занятий
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Курсов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Групп</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Временных слотов
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonTimes.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Days Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedDay === day.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Table Header */}
          <div className="bg-gray-50/80 border-b border-gray-200">
            <div className="grid grid-cols-[120px_repeat(auto-fill,minmax(200px,1fr))]">
              {/* Time column header */}
              <div className="p-4 font-semibold text-gray-700 border-r border-gray-200 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Время
              </div>

              {/* Group columns headers */}
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    {group.name}
                  </div>
                  <div className="text-xs text-gray-500 font-normal mt-1">
                    {group.student_count || 0} студентов
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {getSortedLessonTimes().length > 0
              ? getSortedLessonTimes().map((timeSlot) => (
                  <div
                    key={timeSlot.id}
                    className="grid grid-cols-[120px_repeat(auto-fill,minmax(200px,1fr))] hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Time slot */}
                    <div className="p-4 border-r border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          Урок {timeSlot.order}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {timeSlot.start_time?.slice(0, 5) || "08:00"} -{" "}
                          {timeSlot.end_time?.slice(0, 5) || "09:00"}
                        </div>
                      </div>
                    </div>

                    {/* Schedule cells for each group */}
                    {groups.map((group) => {
                      const schedule = getScheduleForSlot(
                        selectedDay,
                        timeSlot.id,
                        group.id
                      );
                      return (
                        <div
                          key={`${timeSlot.id}-${group.id}`}
                          className="p-3 border-r border-gray-200 last:border-r-0 min-h-[100px] hover:bg-gray-50 cursor-pointer group relative"
                          onClick={() =>
                            handleOpenModal(
                              null,
                              selectedDay,
                              timeSlot,
                              group.id
                            )
                          }
                        >
                          {schedule ? (
                            <div className="h-full">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 h-full">
                                <div className="mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500 text-white mb-2">
                                    {schedule.course_code || "COURSE"}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                  {schedule.course_title || "Название курса"}
                                </h4>
                                {schedule.lecturer_name && (
                                  <p className="text-xs text-gray-600 mb-2">
                                    <span className="font-medium">
                                      Преподаватель:
                                    </span>{" "}
                                    {schedule.lecturer_name}
                                  </p>
                                )}
                                {(schedule.room || schedule.classroom) && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">
                                      Аудитория:
                                    </span>{" "}
                                    {schedule.room || schedule.classroom}
                                  </p>
                                )}
                                <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between">
                                  <span className="text-xs text-blue-600 font-medium">
                                    {schedule.schedule_date
                                      ? new Date(
                                          schedule.schedule_date
                                        ).toLocaleDateString("ru-RU")
                                      : "Регулярное"}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(schedule);
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Изменить"
                                    >
                                      <Edit2 className="w-3 h-3 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(schedule.id);
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Удалить"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                              <div className="text-gray-400 mb-1">
                                <Plus className="w-6 h-6" />
                              </div>
                              <p className="text-xs text-gray-500 text-center px-2">
                                Нажмите чтобы добавить занятие
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              : // Fallback to time slots if no lesson times available
                timeSlots.map((timeSlot) => (
                  <div
                    key={timeSlot.id}
                    className="grid grid-cols-[120px_repeat(auto-fill,minmax(200px,1fr))] hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="p-4 border-r border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          Урок {timeSlot.id}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {timeSlot.start} - {timeSlot.end}
                        </div>
                      </div>
                    </div>

                    {groups.map((group) => {
                      const schedule = schedules.find(
                        (s) =>
                          s.day === selectedDay &&
                          s.group === group.id &&
                          s.start_time?.slice(0, 5) === timeSlot.start
                      );
                      return (
                        <div
                          key={`${timeSlot.id}-${group.id}`}
                          className="p-3 border-r border-gray-200 last:border-r-0 min-h-[100px] hover:bg-gray-50 cursor-pointer group relative"
                          onClick={() =>
                            handleOpenModal(
                              null,
                              selectedDay,
                              { id: timeSlot.id },
                              group.id
                            )
                          }
                        >
                          {schedule ? (
                            <div className="h-full">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 h-full">
                                <div className="mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500 text-white mb-2">
                                    {schedule.course_code || "COURSE"}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                  {schedule.course_title || "Название курса"}
                                </h4>
                                {schedule.lecturer_name && (
                                  <p className="text-xs text-gray-600 mb-2">
                                    <span className="font-medium">
                                      Преподаватель:
                                    </span>{" "}
                                    {schedule.lecturer_name}
                                  </p>
                                )}
                                <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between">
                                  <span className="text-xs text-blue-600 font-medium">
                                    {schedule.schedule_date
                                      ? new Date(
                                          schedule.schedule_date
                                        ).toLocaleDateString("ru-RU")
                                      : "Регулярное"}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(schedule);
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Изменить"
                                    >
                                      <Edit2 className="w-3 h-3 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(schedule.id);
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Удалить"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                              <div className="text-gray-400 mb-1">
                                <Plus className="w-6 h-6" />
                              </div>
                              <p className="text-xs text-gray-500 text-center px-2">
                                Нажмите чтобы добавить занятие
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Условные обозначения</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200"></div>
              <div>
                <p className="font-medium text-gray-900">Занятие</p>
                <p className="text-sm text-gray-600">Запланированное занятие</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300"></div>
              <div>
                <p className="font-medium text-gray-900">Свободно</p>
                <p className="text-sm text-gray-600">Можно добавить занятие</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"></div>
              <div>
                <p className="font-medium text-gray-900">Наведите курсор</p>
                <p className="text-sm text-gray-600">Появится меню действий</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Быстрые действия</h2>
              <p className="text-blue-100">
                Управление расписанием стало проще
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Импорт расписания
              </button>
              <button className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Экспорт в Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSchedule ? "Редактировать занятие" : "Новое занятие"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Debug Info */}
                {courses.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">Курсы не загружены</p>
                    </div>
                  </div>
                )}

                {groups.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">Группы не загружены</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Курс{" "}
                      {courses.length > 0 && `(${courses.length} доступно)`}
                    </span>
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    disabled={courses.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {courses.length === 0
                        ? "Курсы не найдены"
                        : "Выберите курс"}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Группа{" "}
                      {groups.length > 0 && `(${groups.length} доступно)`}
                    </span>
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    required
                    disabled={groups.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {groups.length === 0
                        ? "Группы не найдены"
                        : "Выберите группу"}
                    </option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      День недели
                    </span>
                  </label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Время урока{" "}
                      {lessonTimes.length > 0 &&
                        `(${lessonTimes.length} доступно)`}
                    </span>
                  </label>
                  <select
                    name="lesson_time"
                    value={formData.lesson_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">
                      Не выбрано (использовать общее время)
                    </option>
                    {getSortedLessonTimes().map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        Урок {lt.order}: {lt.start_time?.slice(0, 5) || "08:00"}{" "}
                        - {lt.end_time?.slice(0, 5) || "09:00"}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Если не выбрано, будет использовано общее время для этого
                    временного слота
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Конкретная дата (опционально)
                    </span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Укажите для разового занятия. Если оставить пустым, занятие
                    будет регулярным
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      🏫 Кабинет / Аудитория (опционально)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="Например: 301, Лаб. 5, Ауд. 12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Номер кабинета или аудитории где будет проходить занятие
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all"
                  >
                    {editingSchedule
                      ? "Сохранить изменения"
                      : "Создать занятие"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;
