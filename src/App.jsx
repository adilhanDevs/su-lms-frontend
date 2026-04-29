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

// New Teacher Pages
import TeacherSchedule from "./pages/crud/teacher/TeacherSchedule.jsx";
import TeacherStudents from "./pages/crud/teacher/TeacherStudents.jsx";
import TeacherCourses from "./pages/crud/teacher/TeacherCourses.jsx";
import TeacherMessages from "./pages/crud/teacher/TeacherMessages.jsx";
import TeacherCourseDetail from "./pages/crud/teacher/TeacherCourseDetail.jsx";

// New Student Pages
import StudentSchedule from "./pages/users/StudentSchedule.jsx";
import StudentGrades from "./pages/users/StudentGrades.jsx";
import StudentCourses from "./pages/users/StudentCourses.jsx";
import StudentMessages from "./pages/users/StudentMessages.jsx";

// New Admin Pages
import AdminContracts from "./pages/crud/AdminContracts.jsx";
import AdminInvoices from "./pages/crud/AdminInvoices.jsx";
import AdminParents from "./pages/crud/AdminParents.jsx";
import AdminAuditLogs from "./pages/crud/AdminAuditLogs.jsx";

// Accountant Pages
import AccountantDashboard from "./pages/users/accountant.jsx";
import StaffCrud from "./pages/crud/StaffCrud.jsx";

// Methodologist Pages
import MethodologistDashboard from "./pages/users/methodologist.jsx";
import MethodologistSchedules from "./pages/users/methodologist/MethodologistSchedules.jsx";
import MethodologistPrograms from "./pages/users/methodologist/MethodologistPrograms.jsx";
import MethodologistPerformance from "./pages/users/methodologist/MethodologistPerformance.jsx";
import MethodologistDocuments from "./pages/users/methodologist/MethodologistDocuments.jsx";
import MethodologistCourses from "./pages/users/methodologist/MethodologistCourses.jsx";

// Student/Parent Finance & Documents
import StudentFinance from "./pages/users/StudentFinance.jsx";
import StudentDocuments from "./pages/users/StudentDocuments.jsx";

function Logout() {
  const navigate = React.useMemo(() => null, []);

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
        // Redirect to login — use window.location for full reset of app state
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

        {/* Teacher Pages */}
        <Route path="/teacher/schedule" element={<ProtectedRoute><TeacherSchedule /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute><TeacherStudents /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute><TeacherCourses /></ProtectedRoute>} />
        <Route path="/teacher/messages" element={<ProtectedRoute><TeacherMessages /></ProtectedRoute>} />
        <Route path="/teacher/course/:id" element={<ProtectedRoute><TeacherCourseDetail /></ProtectedRoute>} />

        {/* Student Pages */}
        <Route path="/student/schedule" element={<ProtectedRoute><StudentSchedule /></ProtectedRoute>} />
        <Route path="/student/grades" element={<ProtectedRoute><StudentGrades /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
        <Route path="/student/messages" element={<ProtectedRoute><StudentMessages /></ProtectedRoute>} />

        {/* Admin Pages */}
        <Route path="/admin/contracts" element={<ProtectedRoute><AdminLayout><AdminContracts /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/invoices" element={<ProtectedRoute><AdminLayout><AdminInvoices /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/parents" element={<ProtectedRoute><AdminLayout><AdminParents /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute><AdminLayout><AdminAuditLogs /></AdminLayout></ProtectedRoute>} />

        {/* Staff Management */}
        <Route path="/admin/staff" element={<ProtectedRoute><AdminLayout><StaffCrud /></AdminLayout></ProtectedRoute>} />

        {/* Accountant Pages */}
        <Route path="/accountant/programs" element={<ProtectedRoute><AdminLayout><AccountantDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/accountant/verify" element={<ProtectedRoute><AdminLayout><AccountantDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/accountant/contracts" element={<ProtectedRoute><AdminLayout><AccountantDashboard /></AdminLayout></ProtectedRoute>} />

        {/* Methodologist Pages */}
        <Route path="/methodologist/schedules" element={<ProtectedRoute><AdminLayout><MethodologistSchedules /></AdminLayout></ProtectedRoute>} />
        <Route path="/methodologist/programs" element={<ProtectedRoute><AdminLayout><MethodologistPrograms /></AdminLayout></ProtectedRoute>} />
        <Route path="/methodologist/courses" element={<ProtectedRoute><AdminLayout><MethodologistCourses /></AdminLayout></ProtectedRoute>} />
        <Route path="/methodologist/performance" element={<ProtectedRoute><AdminLayout><MethodologistPerformance /></AdminLayout></ProtectedRoute>} />
        <Route path="/methodologist/documents" element={<ProtectedRoute><AdminLayout><MethodologistDocuments /></AdminLayout></ProtectedRoute>} />

        {/* Student Finance & Documents */}
        <Route path="/student/finance" element={<ProtectedRoute><StudentFinance /></ProtectedRoute>} />
        <Route path="/student/documents" element={<ProtectedRoute><StudentDocuments /></ProtectedRoute>} />

        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
