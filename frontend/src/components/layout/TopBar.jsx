import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import { usePMS, useSearchResults } from '../../pms/usePMS.js'
import { isOverdue } from '../../pms/labels.js'

export default function TopBar({ title }) {
  const { state } = usePMS()
  const { isAdmin, memberId } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const blurRef = useRef(null)
  const results = useSearchResults(q, memberId ? { memberId } : {})

  const member = useMemo(
    () => (memberId ? state.members.find((m) => m.id === memberId) : null),
    [state.members, memberId],
  )

  const overdueCount = useMemo(() => {
    const base = state.tasks.filter(
      (t) => t.dueDate && isOverdue(t.dueDate) && t.status !== 'done',
    )
    if (memberId) {
      return base.filter(
        (t) => t.assigneeId === memberId || t.assigneeId === null,
      ).length
    }
    return base.length
  }, [state.tasks, memberId])

  const totalResults = results.projects.length + results.tasks.length

  function goProject(id) {
    setOpen(false)
    setQ('')
    navigate(`/projects/${id}`)
  }

  function goTask(task) {
    setOpen(false)
    setQ('')
    navigate(`/projects/${task.projectId}`)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <h1 className="min-w-0 truncate text-lg font-semibold text-slate-900">{title}</h1>

      <div className="relative flex max-w-md flex-1 items-center justify-end gap-3">
        <div className="relative w-full max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder={
              isAdmin ? 'Search projects and tasks…' : 'Search your work…'
            }
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                if (blurRef.current?.contains(document.activeElement)) return
                setOpen(false)
              }, 150)
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {open && q.trim() && (
            <div
              ref={blurRef}
              className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              {totalResults === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
              ) : (
                <>
                  {results.projects.length > 0 && (
                    <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Projects
                    </div>
                  )}
                  {results.projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goProject(p.id)}
                      className="flex w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                    >
                      {p.name}
                    </button>
                  ))}
                  {results.tasks.length > 0 && (
                    <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Tasks
                    </div>
                  )}
                  {results.tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goTask(t)}
                      className="flex w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
                    >
                      {t.title}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <Link
          to="/board"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          title="Alerts"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {overdueCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="hidden max-w-[160px] shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50 sm:flex"
        >
          <span className="truncate font-medium text-slate-900">
            {isAdmin ? 'Administrator' : member?.name ?? 'Member'}
          </span>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
            {isAdmin ? 'Admin' : 'User'}
          </span>
        </Link>
      </div>
    </header>
  )
}
