import { useState } from 'react'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'
import Modal from '../components/pms/Modal.jsx'
import Input from '../components/pms/Input.jsx'

const empty = { name: '', role: '', email: '' }

export default function Team() {
  const { state } = usePMS()
  const actions = usePMSActions()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  function openCreate() {
    setEditId(null)
    setForm(empty)
    setModal('edit')
  }

  function openEdit(m) {
    setEditId(m.id)
    setForm({ name: m.name, role: m.role || '', email: m.email || '' })
    setModal('edit')
  }

  function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      actions.updateMember({ id: editId, ...form })
    } else {
      actions.addMember(form)
    }
    setModal(null)
  }

  function confirmDelete(m) {
    setEditId(m.id)
    setForm({ name: m.name, role: m.role, email: m.email })
    setModal('delete')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          Add member
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.members.map((m) => {
          const initials = m.name
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
          const taskCount = state.tasks.filter((t) => t.assigneeId === m.id).length
          return (
            <Card key={m.id}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-800">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{m.name}</h3>
                  <p className="text-sm text-slate-500">{m.role || '—'}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{m.email}</p>
                  <p className="mt-3 text-xs text-slate-500">{taskCount} assigned tasks</p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1.5 text-xs"
                      type="button"
                      onClick={() => openEdit(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="!px-3 !py-1.5 text-xs text-red-600 hover:bg-red-50"
                      type="button"
                      onClick={() => confirmDelete(m)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={editId ? 'Edit member' : 'New member'}>
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Job Role (e.g. Engineer, Designer)"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          />
          <Input
            label="Email (used to log in)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required={!editId}
          />
          {!editId && (
            <p className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs text-indigo-700">
              🔑 Default password: <strong>123456</strong> — the member can log in using their email and this password.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="submit">{editId ? 'Save' : 'Add'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Remove member?">
        <p className="text-sm text-slate-600">
          Remove <strong>{form.name}</strong>? Tasks assigned to them will become unassigned.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => setModal(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              actions.deleteMember(editId)
              setModal(null)
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}
