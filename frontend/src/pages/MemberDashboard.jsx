import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS } from '../pms/usePMS.js'
import Card from '../components/pms/Card.jsx'
import Badge from '../components/pms/Badge.jsx'
import Button from '../components/pms/Button.jsx'
import {
  formatDate,
  isOverdue,
  priorityLabel,
  taskStatusLabel,
} from '../pms/labels.js'

export default function MemberDashboard() {
  const { memberId } = useAuth()
  const { state } = usePMS()

  const myTasks = useMemo(
    () => state.tasks.filter((t) => t.assigneeId === memberId),
    [state.tasks, memberId],
  )

  const stats = useMemo(() => {
    const open = myTasks.filter((t) => t.status !== 'done').length
    const done = myTasks.filter((t) => t.status === 'done').length
    const overdue = myTasks.filter(
      (t) => t.dueDate && isOverdue(t.dueDate) && t.status !== 'done',
    ).length
    const total = myTasks.length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { open, done, overdue, total, pct }
  }, [myTasks])

  const upcoming = useMemo(() => {
    return [...myTasks]
      .filter((t) => t.status !== 'done')
      .sort((a, b) => String(a.dueDate || '').localeCompare(String(b.dueDate || '')))
      .slice(0, 6)
  }, [myTasks])

  const unassignedPool = useMemo(
    () => state.tasks.filter((t) => !t.assigneeId && t.status !== 'done').length,
    [state.tasks],
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Your workload and progress at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/my-tasks">
            <Button variant="secondary" type="button">
              My tasks
            </Button>
          </Link>
          <Link to="/pickup">
            <Button type="button">Pick tasks ({unassignedPool})</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Assigned to you" value={stats.total} hint="All time" />
        <Stat label="Open" value={stats.open} tone="indigo" hint="In progress" />
        <Stat label="Done" value={stats.done} tone="green" hint="Completed" />
        <Stat
          label="Overdue"
          value={stats.overdue}
          tone={stats.overdue > 0 ? 'red' : 'default'}
          hint={stats.overdue > 0 ? 'Needs attention' : 'Clear'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Progress reporting">
            <p className="text-sm text-slate-600">
              Completion across everything assigned to you in this workspace.
            </p>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>Overall</span>
                <span className="font-semibold text-slate-900">{stats.pct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Move cards on the board or update tasks to keep this current.
            </p>
          </Card>
        </div>
        <Card title="Shortcuts">
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="font-medium text-indigo-600 hover:underline" to="/board">
                Open my board
              </Link>
            </li>
            <li>
              <Link className="font-medium text-indigo-600 hover:underline" to="/calendar">
                Calendar
              </Link>
            </li>
            <li>
              <Link className="font-medium text-indigo-600 hover:underline" to="/profile">
                Profile
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <Card title="Upcoming deadlines">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-medium">Task</th>
                <th className="pb-2 font-medium">Project</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcoming.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No open tasks with dates — add due dates in task details.
                  </td>
                </tr>
              ) : (
                upcoming.map((t) => {
                  const proj = state.projects.find((p) => p.id === t.projectId)
                  const od = t.dueDate && isOverdue(t.dueDate)
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 pr-2">
                        <Link
                          to={`/projects/${t.projectId}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {t.title}
                        </Link>
                      </td>
                      <td className="py-2.5 text-slate-600">{proj?.name ?? '—'}</td>
                      <td className="py-2.5">
                        <Badge tone="default">{taskStatusLabel[t.status]}</Badge>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          tone={
                            t.priority === 'high'
                              ? 'red'
                              : t.priority === 'medium'
                                ? 'amber'
                                : 'default'
                          }
                        >
                          {priorityLabel[t.priority]}
                        </Badge>
                      </td>
                      <td className={`py-2.5 ${od ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                        {formatDate(t.dueDate)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, hint, tone = 'default' }) {
  const ring =
    tone === 'indigo'
      ? 'border-indigo-100 bg-indigo-50/80'
      : tone === 'green'
        ? 'border-emerald-100 bg-emerald-50/80'
        : tone === 'red'
          ? 'border-red-100 bg-red-50/80'
          : 'border-slate-200 bg-white'
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${ring}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}
