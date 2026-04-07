import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { formatDate, priorityLabel, taskStatusLabel } from '../pms/labels.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function PickTasks() {
  const { memberId } = useAuth()
  const { state } = usePMS()
  const actions = usePMSActions()

  const pool = useMemo(
    () =>
      state.tasks.filter(
        (t) => !t.assigneeId && t.status !== 'done',
      ),
    [state.tasks],
  )

  function claim(taskId) {
    // #region agent log
    fetch('http://127.0.0.1:7868/ingest/258c934e-c807-4f20-82c4-8744ca0b9834', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bec6ee' },
      body: JSON.stringify({
        sessionId: 'bec6ee',
        runId: window.__pmsRunId || 'pre-fix',
        hypothesisId: 'H4',
        location: 'src/pages/PickTasks.jsx',
        message: 'User claimed task',
        data: { taskId, memberId, poolSize: pool.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    actions.updateTask({ id: taskId, assigneeId: memberId })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <p className="text-sm text-slate-600">
        Unassigned work you can pick up. Claiming assigns the task to you and moves it onto your board.
      </p>

      <Card title="Available tasks">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pool.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nothing in the queue right now.
                  </td>
                </tr>
              ) : (
                pool.map((t) => {
                  const proj = state.projects.find((p) => p.id === t.projectId)
                  return (
                    <tr key={t.id}>
                      <td className="py-3 pr-2 font-medium text-slate-900">{t.title}</td>
                      <td className="py-3">
                        <Link
                          to={`/projects/${t.projectId}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {proj?.name ?? '—'}
                        </Link>
                      </td>
                      <td className="py-3">
                        <Badge tone="default">{taskStatusLabel[t.status]}</Badge>
                      </td>
                      <td className="py-3">
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
                      <td className="py-3 text-slate-600">{formatDate(t.dueDate)}</td>
                      <td className="py-3 text-right">
                        <Button
                          type="button"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => claim(t.id)}
                        >
                          Pick / claim
                        </Button>
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
