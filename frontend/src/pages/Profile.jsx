import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS } from '../pms/usePMS.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function Profile() {
  const { memberId, isAdmin, logout } = useAuth()
  const { state } = usePMS()
  const navigate = useNavigate()

  const member = useMemo(() => {
    if (!memberId) return null
    return state.members.find((m) => m.id === memberId) ?? null
  }, [state.members, memberId])

  const initials = useMemo(() => {
    const name = isAdmin ? 'Administrator' : member?.name || 'Member'
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [isAdmin, member])

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card title="Profile">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-900">
            {initials}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">
                {isAdmin ? 'Administrator' : member?.name}
              </h2>
              <Badge tone={isAdmin ? 'indigo' : 'default'}>
                {isAdmin ? 'Admin' : 'Team member'}
              </Badge>
            </div>
            {!isAdmin && member && (
              <>
                <p className="text-sm text-slate-600">{member.role}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </>
            )}
            {isAdmin && (
              <p className="text-sm text-slate-600">
                Full workspace access: projects, team, settings, and reporting.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Session">
        <p className="text-sm text-slate-600">
          You are signed in on this device. Sign out to switch tier or user (demo uses local session only).
        </p>
        <div className="mt-6">
          <Button variant="danger" type="button" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
