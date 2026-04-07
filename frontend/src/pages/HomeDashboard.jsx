import { useAuth } from '../auth/useAuth.js'
import Dashboard from './Dashboard.jsx'
import MemberDashboard from './MemberDashboard.jsx'

export default function HomeDashboard() {
  const { isMember } = useAuth()
  if (isMember) return <MemberDashboard />
  return <Dashboard />
}
