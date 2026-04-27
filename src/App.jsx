// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./componenets/ProtectedRoute";
import AdminLayout from "./componenets/AdminLayout.jsx";
import LecturersPanel from "./pages/crud/LecturersCrud.jsx";
import StudentsPanel from "./pages/crud/StudentsCrud.jsx";
import UserEdit from "./pages/crud/UserEdit.jsx";
import UserDetail from "./pages/crud/UserDetail.jsx";
import Courses from "./pages/crud/Courses.jsx";
import StudentEdit from "./pages/crud/StudentEdit.jsx";
import TeacherGradesPage from "./pages/crud/teacher/TeacherGradesPage.jsx";
import TeacherAttendance from "./pages/users/TeacherAttendance.jsx";
import StudentAttendance from "./pages/users/StudentAttendance.jsx";
import AdminSchedule from "./pages/crud/AdminSchedule.jsx";
import LessonTimes from "./pages/crud/LessonTimes.jsx";
import GroupsCrud from "./pages/crud/GroupsCrud.jsx";
import ChangePassword from "./componenets/ChangePassword.jsx";
import api from "./api";

function Logout() {
  React.useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout endpoint to clear cookies on server
        await api.post("/accounts/logout/");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Clear any session storage
        sessionStorage.clear();
        // Redirect to login
        window.location.href = "/login";
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">Logging out...</div>
        <div className="text-gray-600">Please wait</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/create-lecturers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <LecturersPanel />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-students"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <StudentsPanel />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teacher/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserDetail role="teacher" />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teacher/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserEdit role="teacher" />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <StudentEdit role="student" />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserEdit role="student" />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Courses />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <GroupsCrud />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/grades/:allocationId"
          element={
            <ProtectedRoute>
              <TeacherGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/:allocationId"
          element={
            <ProtectedRoute>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSchedule />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lesson-times"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <LessonTimes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
