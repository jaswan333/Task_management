import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

export default function MemberRoute({ children }) {
  const { isMember } = useAuth()
  if (!isMember) return <Navigate to="/" replace />
  return children
}
