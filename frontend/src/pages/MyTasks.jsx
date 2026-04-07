import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { TASK_STATUSES, PRIORITIES } from '../pms/reducer.js'
import {
  formatDate,
  isOverdue,
  priorityLabel,
  taskStatusLabel,
} from '../pms/labels.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Modal from '../components/pms/Modal.jsx'
import Input from '../components/pms/Input.jsx'
import Textarea from '../components/pms/Textarea.jsx'
import Select from '../components/pms/Select.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function MyTasks() {
  const { memberId } = useAuth()
  const { state } = usePMS()
  const actions = usePMSActions()

  const rows = useMemo(
    () => state.tasks.filter((t) => t.assigneeId === memberId),
    [state.tasks, memberId],
  )

  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.description && t.description.toLowerCase().includes(s)),
    )
  }, [rows, q])

  function openCreate() {
    setEditId(null)
    setForm({
      title: '',
      description: '',
      projectId: state.projects[0]?.id || '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    })
    setModal('edit')
  }

  function openEdit(task) {
    setEditId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    })
    setModal('edit')
  }

  function save(e) {
    e.preventDefault()
    if (!form.title?.trim() || !form.projectId) return
    if (editId) {
      actions.updateTask({
        id: editId,
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: memberId,
        dueDate: form.dueDate || '',
      })
    } else {
      actions.addTask({
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assigneeId: memberId,
        dueDate: form.dueDate || '',
      })
    }
    setModal(null)
  }

  function confirmDelete(task) {
    setEditId(task.id)
    setForm({ title: task.title })
    setModal('delete')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Filter your tasks…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <Button type="button" onClick={openCreate}>
          Create task
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No tasks yet — create one or pick from the queue.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const proj = state.projects.find((p) => p.id === t.projectId)
                  const od = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done'
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
                      <td className={`py-3 ${od ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                        {formatDate(t.dueDate)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 text-xs"
                          type="button"
                          onClick={() => openEdit(t)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 text-xs text-red-600 hover:bg-red-50"
                          type="button"
                          onClick={() => confirmDelete(t)}
                        >
                          Delete
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

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={editId ? 'Edit task' : 'Create task'} wide>
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Title"
            value={form.title || ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Project"
            value={form.projectId || ''}
            onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            required
          >
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              value={form.status || 'todo'}
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
              value={form.priority || 'medium'}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {priorityLabel[p]}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Due date"
            type="date"
            value={form.dueDate || ''}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <p className="text-xs text-slate-500">Tasks you create are assigned to you.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit">{editId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Delete task?">
        <p className="text-sm text-slate-600">
          Remove <strong>{form.title}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              actions.deleteTask(editId)
              setModal(null)
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
