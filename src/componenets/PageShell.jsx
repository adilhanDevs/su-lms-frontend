import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

/**
 * Lightweight shell for student/teacher/parent secondary pages.
 * Use it to wrap content with a header that includes a back link and a logout button.
 */
export default function PageShell({ title, subtitle, backTo = "/", actions, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/40 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link
              to={backTo}
              className="p-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <Link
              to="/logout"
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center gap-2 font-medium shadow-lg shadow-red-500/25 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
