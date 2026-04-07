import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { PROJECT_STATUSES } from '../pms/reducer.js'
import { formatDate, projectStatusLabel } from '../pms/labels.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Modal from '../components/pms/Modal.jsx'
import Input from '../components/pms/Input.jsx'
import Textarea from '../components/pms/Textarea.jsx'
import Select from '../components/pms/Select.jsx'
import Badge from '../components/pms/Badge.jsx'

const emptyForm = {
  name: '',
  description: '',
  status: 'planning',
  startDate: '',
  endDate: '',
}

export default function Projects() {
  const { state } = usePMS()
  const actions = usePMSActions()
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const filtered = useMemo(() => {
    return state.projects.filter((p) => {
      const matchQ =
        !q.trim() ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
      const matchS = statusFilter === 'all' || p.status === statusFilter
      return matchQ && matchS
    })
  }, [state.projects, q, statusFilter])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModal('edit')
  }

  function openEdit(project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    })
    setModal('edit')
  }

  function saveProject(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) {
      actions.updateProject({ id: editingId, ...form })
    } else {
      actions.addProject(form)
    }
    setModal(null)
  }

  function confirmDelete(project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    })
    setModal('delete')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search projects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {projectStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={openCreate}>
          New project
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Window</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No projects match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-2">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{p.description}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <Badge tone="default">{projectStatusLabel[p.status]}</Badge>
                    </td>
                    <td className="py-3 text-slate-600">
                      {p.startDate || p.endDate
                        ? `${formatDate(p.startDate)} – ${formatDate(p.endDate)}`
                        : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="!px-3 !py-1.5 text-xs" type="button" onClick={() => openEdit(p)}>
                          Edit
                        </Button>
                        <Link to={`/board?project=${p.id}`}>
                          <Button variant="secondary" className="!px-3 !py-1.5 text-xs" type="button">
                            Board
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs text-red-600 hover:bg-red-50"
                          type="button"
                          onClick={() => confirmDelete(p)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modal === 'edit'}
        onClose={() => setModal(null)}
        title={editingId ? 'Edit project' : 'New project'}
        wide
      >
        <form onSubmit={saveProject} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
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
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="End date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modal === 'delete'}
        onClose={() => setModal(null)}
        title="Delete project?"
      >
        <p className="text-sm text-slate-600">
          This removes <strong>{form.name}</strong> and all of its tasks. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              actions.deleteProject(editingId)
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
