import React, { useState } from "react";
import api from "../api";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/accounts/change-password/", formData);
      setMessage({
        type: "success",
        text: response.data.message || "Password changed successfully!",
      });
      // Clear form on success
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle different error types
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = "Failed to change password. ";

        if (errorData.old_password) {
          errorMessage += errorData.old_password[0];
        } else if (errorData.new_password) {
          errorMessage += Array.isArray(errorData.new_password)
            ? errorData.new_password.join(" ")
            : errorData.new_password;
        } else if (errorData.confirm_password) {
          errorMessage += errorData.confirm_password[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage += errorData.non_field_errors[0];
        } else {
          errorMessage = "Please check your input and try again.";
        }

        setMessage({ type: "error", text: errorMessage });
      } else {
        setMessage({
          type: "error",
          text: "Network error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: "Very Weak", color: "bg-red-500" },
      { strength: 1, label: "Weak", color: "bg-orange-500" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
      { strength: 5, label: "Very Strong", color: "bg-emerald-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              🔒
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Change Password
              </h2>
              <p className="text-slate-600 text-sm">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">
                {message.type === "success" ? "✅" : "⚠️"}
              </span>
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {message.type === "success" ? "Success!" : "Error"}
                </div>
                <div className="text-sm">{message.text}</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("old")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.old ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.new_password && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>Password should contain:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li
                      className={
                        formData.new_password.length >= 8
                          ? "text-green-600"
                          : ""
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[a-z]/.test(formData.new_password) &&
                        /[A-Z]/.test(formData.new_password)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      Uppercase and lowercase letters
                    </li>
                    <li
                      className={
                        /\d/.test(formData.new_password) ? "text-green-600" : ""
                      }
                    >
                      At least one number
                    </li>
                    <li
                      className={
                        /[^a-zA-Z0-9]/.test(formData.new_password)
                          ? "text-green-600"
                          : ""
                      }
                    >
                      At least one special character
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {formData.confirm_password &&
              formData.new_password !== formData.confirm_password && (
                <p className="mt-2 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={
                loading ||
                (formData.confirm_password &&
                  formData.new_password !== formData.confirm_password)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Changing Password...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Never share your password with anyone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Use a unique password for this account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Change your password regularly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Avoid using personal information in passwords</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
