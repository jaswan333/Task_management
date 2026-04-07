import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth.jsx'
import AdminRoute from './components/auth/AdminRoute.jsx'
import MemberRoute from './components/auth/MemberRoute.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Login from './pages/Login.jsx'
import HomeDashboard from './pages/HomeDashboard.jsx'
import ProjectsGate from './pages/ProjectsGate.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Kanban from './pages/Kanban.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import Team from './pages/Team.jsx'
import Settings from './pages/Settings.jsx'
import MyTasks from './pages/MyTasks.jsx'
import PickTasks from './pages/PickTasks.jsx'
import Profile from './pages/Profile.jsx'

export default function TaskFlow() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomeDashboard />} />
          <Route path="projects" element={<ProjectsGate />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="board" element={<Kanban />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<Profile />} />

          <Route
            path="my-tasks"
            element={
              <MemberRoute>
                <MyTasks />
              </MemberRoute>
            }
          />
          <Route
            path="pickup"
            element={
              <MemberRoute>
                <PickTasks />
              </MemberRoute>
            }
          />

          <Route
            path="team"
            element={
              <AdminRoute>
                <Team />
              </AdminRoute>
            }
          />
          <Route
            path="settings"
            element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
