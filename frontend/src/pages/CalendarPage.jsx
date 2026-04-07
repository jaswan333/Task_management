import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS } from '../pms/usePMS.js'
import Button from '../components/pms/Button.jsx'
import Badge from '../components/pms/Badge.jsx'
import { taskStatusLabel } from '../pms/labels.js'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function padMonth(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const daysInMonth = last.getDate()
  const startPad = first.getDay()
  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return { cells, daysInMonth }
}

export default function CalendarPage() {
  const { state } = usePMS()
  const { isAdmin, memberId } = useAuth()
  const now = new Date()
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const { cells } = useMemo(
    () => padMonth(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  )

  const label = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const tasksByDay = useMemo(() => {
    const map = new Map()
    const y = cursor.y
    const m = cursor.m
    state.tasks.forEach((t) => {
      if (!t.dueDate) return
      if (!isAdmin && memberId) {
        const mine = t.assigneeId === memberId
        const pool = !t.assigneeId
        if (!mine && !pool) return
      }
      const [yy, mm, dd] = t.dueDate.split('-').map(Number)
      if (yy === y && mm - 1 === m) {
        const key = dd
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(t)
      }
    })
    return map
  }, [state.tasks, cursor.y, cursor.m, isAdmin, memberId])

  function prev() {
    setCursor((c) => {
      let { y, m } = c
      m -= 1
      if (m < 0) {
        m = 11
        y -= 1
      }
      return { y, m }
    })
  }

  function next() {
    setCursor((c) => {
      let { y, m } = c
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
      return { y, m }
    })
  }

  function today() {
    const n = new Date()
    setCursor({ y: n.getFullYear(), m: n.getMonth() })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{label}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" type="button" onClick={prev}>
            Previous
          </Button>
          <Button variant="secondary" type="button" onClick={today}>
            Today
          </Button>
          <Button variant="secondary" type="button" onClick={next}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        {weekdays.map((w) => (
          <div
            key={w}
            className="bg-slate-100 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600"
          >
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="min-h-[100px] bg-slate-50" />
          }
          const list = tasksByDay.get(day) || []
          const isToday =
            day === now.getDate() &&
            cursor.m === now.getMonth() &&
            cursor.y === now.getFullYear()
          return (
            <div
              key={day}
              className={`min-h-[100px] bg-white p-1.5 ${isToday ? 'ring-2 ring-inset ring-indigo-400' : ''}`}
            >
              <div className="mb-1 text-right text-xs font-medium text-slate-500">{day}</div>
              <ul className="space-y-1">
                {list.map((t) => {
                  const proj = state.projects.find((p) => p.id === t.projectId)
                  return (
                    <li key={t.id}>
                      <Link
                        to={`/projects/${t.projectId}`}
                        className="block truncate rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-800 hover:border-indigo-200 hover:bg-indigo-50"
                        title={t.title}
                      >
                        {t.title}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        <Badge tone="default" className="!text-[9px]">
                          {taskStatusLabel[t.status]}
                        </Badge>
                        {proj && (
                          <span className="truncate text-[9px] text-slate-400">{proj.name}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <p className="text-sm text-slate-500">
        {isAdmin
          ? 'Tasks appear on their due date. Drag tasks on the board to change status; edit due dates in project or task forms.'
          : 'Your assigned tasks and open unassigned items appear on their due dates.'}
      </p>
    </div>
  )
}
