export const projectStatusLabel = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
}

export const taskStatusLabel = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
}

export const priorityLabel = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  const d = new Date(dueDate + 'T23:59:59')
  return d < new Date()
}
