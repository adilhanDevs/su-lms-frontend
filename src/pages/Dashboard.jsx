import React from 'react'
import AdminDashboard from './users/admin.jsx'
import TeacherDashboard from './users/teacher.jsx'
import StudentDashboard from './users/student.jsx'
import { useAuth } from '../hooks/useAuth'
import ParentDashboard from './users/parent.jsx'
import AdminLayout from '../componenets/AdminLayout.jsx'
import AccountantDashboard from './users/accountant.jsx'
import MethodologistDashboard from './users/methodologist.jsx'

const Dashboard = () => {
  const { loading, role } = useAuth()

  // Debug logging
  console.log("📊 Dashboard - Loading:", loading, "Role:", role);

  // Показываем loading пока определяем роль
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium">
            Loading dashboard...
          </div>
        </div>
      </div>
    )
  }

  // Рендерим соответствующий дашборд в зависимости от роли
  switch (role) {
    case 'admin':
      return (
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      )
    case 'lecturer':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    case 'parent':
      return <ParentDashboard />
    case 'accountant':
      return (
        <AdminLayout>
          <AccountantDashboard />
        </AdminLayout>
      )
    case 'methodologist':
      return (
        <AdminLayout>
          <MethodologistDashboard />
        </AdminLayout>
      )
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Role Not Defined
              </h2>
              <p className="text-gray-600">
                Please set your role to view the dashboard
              </p>
            </div>
          </div>
        </div>
      )
  }
}

export default Dashboard