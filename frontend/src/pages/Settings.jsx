import { useRef, useState } from 'react'
import { usePMS, usePMSActions } from '../pms/usePMS.js'
import { initialState, STORAGE_KEY } from '../pms/reducer.js'
import Card from '../components/pms/Card.jsx'
import Button from '../components/pms/Button.jsx'

export default function Settings() {
  const { state } = usePMS()
  const actions = usePMSActions()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  function exportJson() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            projects: state.projects,
            tasks: state.tasks,
            members: state.members,
            activities: state.activities,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMsg({ type: 'ok', text: 'Export started.' })
  }

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (!data.projects || !data.tasks || !data.members) {
          throw new Error('Invalid file')
        }
        actions.importData({
          projects: data.projects,
          tasks: data.tasks,
          members: data.members,
          activities: data.activities || [],
        })
        setMsg({ type: 'ok', text: 'Data imported. Page will reflect new content.' })
      } catch {
        setMsg({ type: 'err', text: 'Could not import: invalid JSON or structure.' })
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  function reset() {
    if (!window.confirm('Reset all data to factory sample? This clears local storage.')) return
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {msg && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {msg.text}
        </div>
      )}

      <Card title="Backup & restore">
        <p className="text-sm text-slate-600">
          Your workspace is stored in this browser ({STORAGE_KEY}). Export regularly or before clearing site data.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={exportJson}>
            Export JSON
          </Button>
          <Button variant="secondary" type="button" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFile}
          />
        </div>
      </Card>

      <Card title="Factory reset">
        <p className="text-sm text-slate-600">
          Replace everything with the built-in sample projects, tasks, and team. Useful for demos.
        </p>
        <div className="mt-6">
          <Button variant="danger" type="button" onClick={reset}>
            Reset to sample data
          </Button>
        </div>
      </Card>

      <Card title="About">
        <p className="text-sm text-slate-600">
          TaskFlow PMS runs entirely in the browser. For production use, connect these screens to your API and
          authentication layer.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Sample: {initialState.projects.length} projects, {initialState.tasks.length} tasks,{' '}
          {initialState.members.length} members.
        </p>
      </Card>
    </div>
  )
}
