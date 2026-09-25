import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, homeRouteForRole } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

import StudentDashboard from './pages/student/Dashboard'
import RequestsList from './pages/student/RequestsList'
import NewRequest from './pages/student/NewRequest'
import RequestDetail from './pages/student/RequestDetail'

import StaffDashboard from './pages/staff/Dashboard'

import LeadDashboard from './pages/lead/Dashboard'
import Heatmap from './pages/lead/Heatmap'
import Analytics from './pages/lead/Analytics'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AuditLogs from './pages/admin/AuditLogs'
import Settings from './pages/admin/Settings'

import Notifications from './pages/shared/Notifications'
import Profile from './pages/shared/Profile'

const STUDENT_FACULTY = ['STUDENT', 'FACULTY']
const STAFF = ['SERVICE_STAFF']
const LEAD_ADMIN = ['SERVICE_LEAD', 'ADMIN']
const ADMIN = ['ADMIN']
const ANY = ['STUDENT', 'FACULTY', 'SERVICE_STAFF', 'SERVICE_LEAD', 'ADMIN']

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return <Navigate to={homeRouteForRole(user.role)} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student / Faculty */}
      <Route path="/dashboard" element={<ProtectedRoute roles={STUDENT_FACULTY}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute roles={STUDENT_FACULTY}><RequestsList /></ProtectedRoute>} />
      <Route path="/requests/new" element={<ProtectedRoute roles={STUDENT_FACULTY}><NewRequest /></ProtectedRoute>} />
      <Route path="/requests/:id" element={<ProtectedRoute roles={ANY}><RequestDetail /></ProtectedRoute>} />

      {/* Service Staff */}
      <Route path="/staff/dashboard" element={<ProtectedRoute roles={STAFF}><StaffDashboard /></ProtectedRoute>} />
      <Route
        path="/staff/requests"
        element={
          <ProtectedRoute roles={STAFF}>
            <RequestsList title="Assigned Requests" linkPrefix="/staff/requests" />
          </ProtectedRoute>
        }
      />
      <Route path="/staff/requests/:id" element={<ProtectedRoute roles={STAFF}><RequestDetail /></ProtectedRoute>} />

      {/* Service Lead (+ Admin shares the requests/heatmap/analytics views) */}
      <Route path="/lead/dashboard" element={<ProtectedRoute roles={LEAD_ADMIN}><LeadDashboard /></ProtectedRoute>} />
      <Route
        path="/lead/requests"
        element={
          <ProtectedRoute roles={LEAD_ADMIN}>
            <RequestsList title="All Requests" linkPrefix="/lead/requests" />
          </ProtectedRoute>
        }
      />
      <Route path="/lead/requests/:id" element={<ProtectedRoute roles={LEAD_ADMIN}><RequestDetail /></ProtectedRoute>} />
      <Route path="/lead/heatmap" element={<ProtectedRoute roles={LEAD_ADMIN}><Heatmap /></ProtectedRoute>} />
      <Route path="/lead/analytics" element={<ProtectedRoute roles={LEAD_ADMIN}><Analytics /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={ADMIN}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={ADMIN}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute roles={ADMIN}><AuditLogs /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={ADMIN}><Settings /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/notifications" element={<ProtectedRoute roles={ANY}><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={ANY}><Profile /></ProtectedRoute>} />

      <Route path="/home" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
