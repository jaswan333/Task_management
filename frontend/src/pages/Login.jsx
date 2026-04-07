import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import Button from '../components/pms/Button.jsx'
import Input from '../components/pms/Input.jsx'

export default function Login() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const r = await login(email, password)
    if (r.ok) navigate(from, { replace: true })
    else setError(r.error || 'Sign-in failed.')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-1 ring-white/20">
            TF
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            TaskFlow
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Project management — sign in as administrator or team member.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
          <div className="p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-800 text-center">Sign In</h2>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                Admin: <strong>admin@gmail.com</strong> / <strong>admin</strong> &nbsp;|&nbsp; Members: use email + <strong>123456</strong>
              </p>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
