import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { memberCanAccessProject } from '../pms/memberAccess.js'
import { PROJECT_STATUSES, TASK_STATUSES, PRIORITIES } from '../pms/reducer.js'
import {
  formatDate,
  isOverdue,
  priorityLabel,
  projectStatusLabel,
  taskStatusLabel,
} from '../pms/labels.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Modal from '../components/pms/Modal.jsx'
import Input from '../components/pms/Input.jsx'
import Textarea from '../components/pms/Textarea.jsx'
import Select from '../components/pms/Select.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const { state } = usePMS()
  const actions = usePMSActions()
  const { isAdmin, memberId } = useAuth()
  const project = state.projects.find((p) => p.id === projectId)

  const tasks = useMemo(() => {
    const list = state.tasks.filter((t) => t.projectId === projectId)
    if (isAdmin) return list
    return list.filter(
      (t) => t.assigneeId === memberId || t.assigneeId === null,
    )
  }, [state.tasks, projectId, isAdmin, memberId])

  const [editOpen, setEditOpen] = useState(false)
  const [taskModal, setTaskModal] = useState(null)
  const [pForm, setPForm] = useState({})
  const [tForm, setTForm] = useState({})
  const [taskEditId, setTaskEditId] = useState(null)

  if (!project) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">Project not found.</p>
        <Link to="/projects" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to projects
        </Link>
      </div>
    )
  }

  if (
    !isAdmin &&
    memberId &&
    !memberCanAccessProject(state, projectId, memberId)
  ) {
    return <Navigate to="/projects" replace />
  }

  function openEditProject() {
    setPForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    })
    setEditOpen(true)
  }

  function saveProject(e) {
    e.preventDefault()
    if (!pForm.name?.trim()) return
    actions.updateProject({ id: project.id, ...pForm })
    setEditOpen(false)
  }

  function openNewTask() {
    setTaskEditId(null)
    setTForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: isAdmin ? state.members[0]?.id ?? '' : memberId ?? '',
      dueDate: '',
    })
    setTaskModal('edit')
  }

  function openEditTask(task) {
    setTaskEditId(task.id)
    setTForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate || '',
    })
    setTaskModal('edit')
  }

  function saveTask(e) {
    e.preventDefault()
    if (!tForm.title?.trim()) return
    const payload = {
      projectId: project.id,
      title: tForm.title,
      description: tForm.description,
      status: tForm.status,
      priority: tForm.priority,
      assigneeId: isAdmin ? tForm.assigneeId || null : memberId,
      dueDate: tForm.dueDate || '',
    }
    if (taskEditId) {
      actions.updateTask({ id: taskEditId, ...payload })
    } else {
      actions.addTask(payload)
    }
    setTaskModal(null)
  }

  function confirmDeleteTask(task) {
    setTaskEditId(task.id)
    setTForm({ title: task.title })
    setTaskModal('delete')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link to="/projects" className="text-indigo-600 hover:underline">
              Projects
            </Link>
            <span className="mx-1 text-slate-400">/</span>
            {project.name}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{project.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="default">{projectStatusLabel[project.status]}</Badge>
            <span className="text-sm text-slate-500">
              {formatDate(project.startDate)} – {formatDate(project.endDate)}
            </span>
          </div>
          {project.description && <p className="mt-3 max-w-2xl text-slate-600">{project.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button variant="secondary" type="button" onClick={openEditProject}>
              Edit project
            </Button>
          )}
          <Link to={`/board?project=${project.id}`}>
            <Button type="button">Open board</Button>
          </Link>
          <Button type="button" onClick={openNewTask}>
            Add task
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Progress">
          <div className="mb-2 flex justify-between text-sm text-slate-600">
            <span>Completion</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Auto-calculated from tasks in the Done column.
          </p>
        </Card>
        <Card title="Tasks">
          <p className="text-3xl font-semibold text-slate-900">{tasks.length}</p>
          <p className="text-sm text-slate-500">Total in this project</p>
        </Card>
        <Card title="Open">
          <p className="text-3xl font-semibold text-slate-900">
            {tasks.filter((t) => t.status !== 'done').length}
          </p>
          <p className="text-sm text-slate-500">Not completed</p>
        </Card>
      </div>

      <Card title="Tasks">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Assignee</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No tasks yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => {
                  const member = state.members.find((m) => m.id === t.assigneeId)
                  const od = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done'
                  const isMine = t.assigneeId === memberId
                  const unassigned = !t.assigneeId
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 font-medium text-slate-900">{t.title}</td>
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
                      <td className="py-2.5 text-slate-600">{member?.name ?? '—'}</td>
                      <td className={`py-2.5 ${od ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                        {formatDate(t.dueDate)}
                      </td>
                      <td className="py-2.5 text-right">
                        {unassigned && !isAdmin && (
                          <Button
                            variant="ghost"
                            className="!px-2 !py-1 text-xs text-indigo-600"
                            type="button"
                            onClick={() =>
                              actions.updateTask({ id: t.id, assigneeId: memberId })
                            }
                          >
                            Claim
                          </Button>
                        )}
                        {(isAdmin || isMine) && (
                          <>
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs"
                              type="button"
                              onClick={() => openEditTask(t)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs text-red-600 hover:bg-red-50"
                              type="button"
                              onClick={() => confirmDeleteTask(t)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isAdmin && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit project"
          wide
        >
        <form onSubmit={saveProject} className="space-y-4">
          <Input
            label="Name"
            value={pForm.name || ''}
            onChange={(e) => setPForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={pForm.description || ''}
            onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Status"
            value={pForm.status || 'planning'}
            onChange={(e) => setPForm((f) => ({ ...f, status: e.target.value }))}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {projectStatusLabel[s]}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              value={pForm.startDate || ''}
              onChange={(e) => setPForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="End date"
              type="date"
              value={pForm.endDate || ''}
              onChange={(e) => setPForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
        </Modal>
      )}

      <Modal
        open={taskModal === 'edit'}
        onClose={() => setTaskModal(null)}
        title={taskEditId ? 'Edit task' : 'New task'}
        wide
      >
        <form onSubmit={saveTask} className="space-y-4">
          <Input
            label="Title"
            value={tForm.title || ''}
            onChange={(e) => setTForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            value={tForm.description || ''}
            onChange={(e) => setTForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              value={tForm.status || 'todo'}
              onChange={(e) => setTForm((f) => ({ ...f, status: e.target.value }))}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {taskStatusLabel[s]}
                </option>
              ))}
            </Select>
            <Select
              label="Priority"
              value={tForm.priority || 'medium'}
              onChange={(e) => setTForm((f) => ({ ...f, priority: e.target.value }))}
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
              value={tForm.assigneeId || ''}
              onChange={(e) => setTForm((f) => ({ ...f, assigneeId: e.target.value }))}
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
              Assignee: <strong>You</strong> (members create work for themselves)
            </p>
          )}
          <Input
            label="Due date"
            type="date"
            value={tForm.dueDate || ''}
            onChange={(e) => setTForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setTaskModal(null)}>
              Cancel
            </Button>
            <Button type="submit">{taskEditId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={taskModal === 'delete'} onClose={() => setTaskModal(null)} title="Delete task?">
        <p className="text-sm text-slate-600">
          Remove <strong>{tForm.title}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setTaskModal(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              actions.deleteTask(taskEditId)
              setTaskModal(null)
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
