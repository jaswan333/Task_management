import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { projectsForMember } from '../pms/memberAccess.js'
import { TASK_STATUSES, PRIORITIES } from '../pms/reducer.js'
import { formatDate, isOverdue, priorityLabel, taskStatusLabel } from '../pms/labels.js'
import Button from '../components/pms/Button.jsx'
import Modal from '../components/pms/Modal.jsx'
import Input from '../components/pms/Input.jsx'
import Textarea from '../components/pms/Textarea.jsx'
import Select from '../components/pms/Select.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function Kanban() {
  const { state } = usePMS()
  const actions = usePMSActions()
  const { isAdmin, memberId } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') || ''

  const tasks = useMemo(() => {
    let list = state.tasks
    if (!isAdmin && memberId) {
      list = list.filter((t) => t.assigneeId === memberId)
    }
    if (projectFilter) {
      list = list.filter((t) => t.projectId === projectFilter)
    }
    return list
  }, [state.tasks, projectFilter, isAdmin, memberId])

  const [dragId, setDragId] = useState(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: projectFilter || state.projects[0]?.id || '',
    status: 'todo',
    priority: 'medium',
    assigneeId: state.members[0]?.id ?? '',
    dueDate: '',
  })

  const projectOptions = useMemo(() => {
    if (isAdmin) return state.projects
    return projectsForMember(state, memberId)
  }, [state, isAdmin, memberId])

  function onDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function onDrop(e, status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (!id) return
    if (!isAdmin && memberId) {
      const t = state.tasks.find((x) => x.id === id)
      if (!t || t.assigneeId !== memberId) return
    }
    actions.moveTask(id, status)
    setDragId(null)
  }

  function openCreate() {
    const defaultProject =
      projectFilter ||
      projectOptions[0]?.id ||
      state.projects[0]?.id ||
      ''
    setForm({
      title: '',
      description: '',
      projectId: defaultProject,
      status: 'todo',
      priority: 'medium',
      assigneeId: isAdmin ? state.members[0]?.id ?? '' : memberId ?? '',
      dueDate: '',
    })
    setModal(true)
  }

  function submitTask(e) {
    e.preventDefault()
    if (!form.title?.trim() || !form.projectId) return
    actions.addTask({
      projectId: form.projectId,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigneeId: isAdmin ? form.assigneeId || null : memberId,
      dueDate: form.dueDate || '',
    })
    setModal(false)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {!isAdmin && (
            <p className="text-sm text-slate-600">Showing tasks assigned to you.</p>
          )}
          <label className="text-sm text-slate-600">
            Project filter
            <select
              className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={projectFilter}
              onChange={(e) => {
                const v = e.target.value
                if (v) setSearchParams({ project: v })
                else setSearchParams({})
              }}
            >
              <option value="">All projects</option>
              {(isAdmin ? state.projects : projectOptions).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="button" onClick={openCreate} disabled={!isAdmin && projectOptions.length === 0}>
          Add task
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const col = tasks.filter((t) => t.status === status)
          return (
            <div
              key={status}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status)}
              className="flex min-h-[320px] flex-col rounded-xl border border-slate-200 bg-slate-100/80 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-slate-800">{taskStatusLabel[status]}</h3>
                <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                  {col.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {col.map((t) => {
                  const proj = state.projects.find((p) => p.id === t.projectId)
                  const member = state.members.find((m) => m.id === t.assigneeId)
                  const od = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done'
                  const canDrag = isAdmin || t.assigneeId === memberId
                  return (
                    <article
                      key={t.id}
                      draggable={canDrag}
                      onDragStart={(e) => canDrag && onDragStart(e, t.id)}
                      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${
                        canDrag ? 'cursor-grab active:cursor-grabbing' : 'opacity-90'
                      }`}
                    >
                      <p className="font-medium text-slate-900">{t.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{proj?.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
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
                        {member && (
                          <span className="text-xs text-slate-600">{member.name}</span>
                        )}
                      </div>
                      <p className={`mt-2 text-xs ${od ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                        Due {formatDate(t.dueDate)}
                      </p>
                      <Link
                        to={`/projects/${t.projectId}`}
                        className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Open project
                      </Link>
                    </article>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New task" wide>
        <form onSubmit={submitTask} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Project"
            value={form.projectId}
            onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            required
          >
            {(isAdmin ? state.projects : projectOptions).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Column"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {taskStatusLabel[s]}
                </option>
              ))}
            </Select>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel[p]}
                </option>
              ))}
            </Select>
          </div>
          {isAdmin ? (
            <Select
              label="Assignee"
              value={form.assigneeId || ''}
              onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {state.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-slate-600">
              Assignee: <strong>You</strong>
            </p>
          )}
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
