import { Navigate } from "react-router-dom";
import api from "../api";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to access a protected endpoint
      // The cookies will be sent automatically
      const response = await api.get("/accounts/profile/");

      if (response.status === 200) {
        console.log("✅ User is authorized");
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log("❌ Authorization check failed:", error);

      // If we get 401, tokens might be expired
      // The api interceptor will try to refresh automatically
      if (error.response?.status === 401) {
        setIsAuthorized(false);
      } else {
        // Other errors, consider unauthorized
        setIsAuthorized(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium">
            Checking authorization...
          </div>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
