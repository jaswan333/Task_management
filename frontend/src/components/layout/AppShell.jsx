import { Outlet, useLocation, useMatch } from 'react-router-dom'
import { useMemo } from 'react'
import { usePMS } from '../../pms/usePMS.js'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

const titles = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/my-tasks': 'My tasks',
  '/pickup': 'Pick tasks',
  '/board': 'Task board',
  '/calendar': 'Calendar',
  '/team': 'Team',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

function titleForPath(pathname, projectName) {
  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    return projectName || 'Project'
  }
  return titles[pathname] ?? 'TaskFlow'
}

export default function AppShell() {
  const { pathname } = useLocation()
  const projectMatch = useMatch('/projects/:projectId')
  const projectId = projectMatch?.params?.projectId
  const { state } = usePMS()
  const projectName = useMemo(() => {
    if (!projectId) return null
    return state.projects.find((p) => p.id === projectId)?.name ?? null
  }, [projectId, state.projects])
  const title = titleForPath(pathname, projectName)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
