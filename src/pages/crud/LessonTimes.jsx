import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Clock, Save, X } from "lucide-react";
import api from "../../api";

const LessonTimes = () => {
  const [lessonTimes, setLessonTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    order: "",
    start_time: "",
    end_time: "",
  });

  // Загрузка времен уроков
  const fetchLessonTimes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/attendance/lesson-times/");
      setLessonTimes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching lesson times:", err);
      setError("Ошибка загрузки времен уроков");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonTimes();
  }, []);

  // Очистка формы
  const resetForm = () => {
    setFormData({
      order: "",
      start_time: "",
      end_time: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Создание нового времени урока
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/attendance/lesson-times/", formData);
      setSuccess("Время урока успешно создано");
      resetForm();
      fetchLessonTimes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error creating lesson time:", err);
      setError(err.response?.data?.message || "Ошибка создания времени урока");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Обновление времени урока
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/attendance/lesson-times/${editingId}/`, formData);
      setSuccess("Время урока успешно обновлено");
      resetForm();
      fetchLessonTimes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating lesson time:", err);
      setError(
        err.response?.data?.message || "Ошибка обновления времени урока"
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  // Удаление времени урока
  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это время урока?")) {
      return;
    }

    try {
      await api.delete(`/attendance/lesson-times/${id}/`);
      setSuccess("Время урока успешно удалено");
      fetchLessonTimes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting lesson time:", err);
      setError(err.response?.data?.message || "Ошибка удаления времени урока");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Начать редактирование
  const startEdit = (lessonTime) => {
    setIsEditing(true);
    setEditingId(lessonTime.id);
    setFormData({
      order: lessonTime.order,
      start_time: lessonTime.start_time,
      end_time: lessonTime.end_time,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          <Clock className="inline-block mr-2 mb-1" size={32} />
          Управление временами уроков
        </h1>
        <p className="text-gray-600">
          Настройте стандартные времена начала и окончания уроков
        </p>
      </div>

      {/* Сообщения об успехе/ошибке */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма создания/редактирования */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing
              ? "Редактировать время урока"
              : "Добавить новое время урока"}
          </h2>

          <form
            onSubmit={isEditing ? handleUpdate : handleCreate}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер урока
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1, 2, 3..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время начала
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время окончания
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {isEditing ? (
                  <>
                    <Save size={20} />
                    Сохранить
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Добавить
                  </>
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X size={20} />
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Список времен уроков */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Список времен уроков</h2>

          {lessonTimes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>Времена уроков еще не добавлены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonTimes.map((lessonTime) => (
                <div
                  key={lessonTime.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Урок {lessonTime.order}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} />
                        <span className="font-medium">
                          {lessonTime.start_time.slice(0, 5)} -{" "}
                          {lessonTime.end_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(lessonTime)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(lessonTime.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonTimes;
