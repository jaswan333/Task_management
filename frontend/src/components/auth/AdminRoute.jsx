import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'

export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
