import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../../../api";

const TeacherMessages = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("api/notifications/");
        setNotifications(res.data || []);
      } catch (e) {
        console.error("notifications error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`api/notifications/${id}/read/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await markRead(n.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-green-600" /> Notifications
              </h1>
              <p className="text-gray-600">Your recent messages and alerts</p>
            </div>
          </div>
          
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllRead}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>You have no notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`p-5 rounded-xl border transition-all ${
                    n.is_read 
                      ? "bg-gray-50 border-gray-100 opacity-75" 
                      : "bg-white border-blue-200 shadow-sm cursor-pointer hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full ${n.is_read ? 'bg-gray-200' : 'bg-blue-100'}`}>
                      <Bell className={`w-5 h-5 ${n.is_read ? "text-gray-500" : "text-blue-600"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                        <p className={`font-bold ${n.is_read ? "text-gray-700" : "text-gray-900"}`}>
                          {n.title}
                        </p>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm ${n.is_read ? "text-gray-500" : "text-gray-700"}`}>
                        {n.message}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    )}
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

export default TeacherMessages;
