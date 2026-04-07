import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { usePMS } from '../pms/usePMS.js'
import Card from '../components/pms/Card.jsx'
import Badge from '../components/pms/Badge.jsx'
import {
  formatDate,
  isOverdue,
  priorityLabel,
  projectStatusLabel,
  taskStatusLabel,
} from '../pms/labels.js'

export default function Dashboard() {
  const { state } = usePMS()

  const stats = useMemo(() => {
    const { projects, tasks } = state
    const activeProjects = projects.filter((p) => p.status === 'active').length
    const openTasks = tasks.filter((t) => t.status !== 'done').length
    const doneTasks = tasks.filter((t) => t.status === 'done').length
    const overdue = tasks.filter(
      (t) => t.dueDate && isOverdue(t.dueDate) && t.status !== 'done',
    ).length
    return { activeProjects, openTasks, doneTasks, overdue, totalProjects: projects.length }
  }, [state])

  const recentTasks = useMemo(() => {
    return [...state.tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [state.tasks])

  const recentActivity = state.activities.slice(0, 8)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm text-slate-500">Welcome back — here is your workspace at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active projects"
          value={stats.activeProjects}
          footnote={`${stats.totalProjects} total in portfolio`}
        />
        <StatCard label="Open tasks" value={stats.openTasks} tone="indigo" footnote="Not completed" />
        <StatCard label="Completed" value={stats.doneTasks} tone="green" footnote="Tasks marked done" />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          tone={stats.overdue > 0 ? 'red' : 'default'}
          footnote={stats.overdue > 0 ? 'Past due date' : 'None right now'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Projects overview">
            <ul className="divide-y divide-slate-100">
              {state.projects.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone="default">{projectStatusLabel[p.status]}</Badge>
                      <span className="text-xs text-slate-500">
                        {p.startDate && p.endDate
                          ? `${formatDate(p.startDate)} – ${formatDate(p.endDate)}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-40">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Recent activity">
            <ul className="space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="text-slate-800">{a.text}</p>
                  {a.detail && <p className="text-xs text-slate-500">{a.detail}</p>}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(a.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Latest tasks">
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
              {recentTasks.map((t) => {
                const proj = state.projects.find((p) => p.id === t.projectId)
                const od = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done'
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
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, footnote, tone = 'default' }) {
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
      <p className="mt-1 text-xs text-slate-500">{footnote}</p>
    </div>
  )
}
