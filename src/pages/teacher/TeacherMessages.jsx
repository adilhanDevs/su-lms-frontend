import React, { useEffect, useState } from "react";
import api from "../../api";
import PageShell from "../../componenets/PageShell";
import { Bell, Inbox, AlertCircle, CheckCircle } from "lucide-react";

export default function TeacherMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("api/notifications/");
        setItems(r.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`api/notifications/${id}/read/`, { is_read: true });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.is_read);
    await Promise.allSettled(
      unread.map((n) =>
        api.patch(`api/notifications/${n.id}/read/`, { is_read: true })
      )
    );
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const iconFor = (type) =>
    type === "warning" ? (
      <AlertCircle className="w-5 h-5 text-rose-500" />
    ) : type === "success" ? (
      <CheckCircle className="w-5 h-5 text-emerald-500" />
    ) : (
      <Bell className="w-5 h-5 text-blue-500" />
    );

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <PageShell
      title="Notifications"
      subtitle={`${unread} unread`}
      actions={
        unread > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
          >
            Mark all read
          </button>
        )
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Your inbox is empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`p-5 rounded-2xl border cursor-pointer ${
                n.is_read
                  ? "bg-gray-50 border-gray-100 opacity-70"
                  : "bg-white border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div>{iconFor(n.notification_type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900">{n.title}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
