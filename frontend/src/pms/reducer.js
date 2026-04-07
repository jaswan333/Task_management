export const STORAGE_KEY = 'taskflow-pms-v1'

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed']
export const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done']
export const PRIORITIES = ['low', 'medium', 'high']

function uid() {
  return crypto.randomUUID()
}

function activity(type, text, detail = '') {
  return { id: uid(), type, text, detail, at: new Date().toISOString() }
}

export const initialState = {
  projects: [],
  tasks: [],
  members: [],
  activities: [],
}

function sliceActs(acts) {
  return acts.slice(0, 100)
}

function recalcProjectProgress(projects, tasks, projectId) {
  const list = tasks.filter((t) => t.projectId === projectId)
  if (list.length === 0) {
    return projects.map((p) =>
      p.id === projectId ? { ...p, progress: 0 } : p,
    )
  }
  const done = list.filter((t) => t.status === 'done').length
  const pct = Math.round((done / list.length) * 100)
  return projects.map((p) => (p.id === projectId ? { ...p, progress: pct } : p))
}

export function pmsReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const { projects, tasks, members, activities } = action.payload
      return {
        ...state,
        projects: projects ?? state.projects,
        tasks: tasks ?? state.tasks,
        members: members ?? state.members,
        activities: activities ?? state.activities,
      }
    }
    case 'ADD_PROJECT': {
      const p = {
        id: uid(),
        name: action.payload.name,
        description: action.payload.description || '',
        status: action.payload.status || 'planning',
        startDate: action.payload.startDate || '',
        endDate: action.payload.endDate || '',
        progress: 0,
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        projects: [...state.projects, p],
        activities: sliceActs([
          activity('project', `Project created`, p.name),
          ...state.activities,
        ]),
      }
    }
    case 'UPDATE_PROJECT': {
      const { id, ...rest } = action.payload
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...rest } : p,
        ),
        activities: sliceActs([
          activity('project', 'Project updated', rest.name || id),
          ...state.activities,
        ]),
      }
    }
    case 'DELETE_PROJECT': {
      const id = action.payload
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== id),
        tasks: state.tasks.filter((t) => t.projectId !== id),
        activities: sliceActs([
          activity('project', 'Project removed', id),
          ...state.activities,
        ]),
      }
    }
    case 'ADD_TASK': {
      const t = {
        id: uid(),
        projectId: action.payload.projectId,
        title: action.payload.title,
        description: action.payload.description || '',
        status: action.payload.status || 'todo',
        priority: action.payload.priority || 'medium',
        assigneeId: action.payload.assigneeId || null,
        dueDate: action.payload.dueDate || '',
        createdAt: new Date().toISOString(),
      }
      let projects = state.projects
      projects = recalcProjectProgress(projects, [...state.tasks, t], t.projectId)
      return {
        ...state,
        projects,
        tasks: [...state.tasks, t],
        activities: sliceActs([
          activity('task', 'Task created', t.title),
          ...state.activities,
        ]),
      }
    }
    case 'UPDATE_TASK': {
      const { id, ...rest } = action.payload
      const prev = state.tasks.find((x) => x.id === id)
      const nextTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, ...rest } : t,
      )
      let projects = state.projects
      if (prev && (rest.status !== undefined || rest.projectId !== undefined)) {
        const pid = rest.projectId ?? prev.projectId
        projects = recalcProjectProgress(projects, nextTasks, pid)
        if (rest.projectId && rest.projectId !== prev.projectId) {
          projects = recalcProjectProgress(
            projects,
            nextTasks,
            prev.projectId,
          )
        }
      }
      return {
        ...state,
        projects,
        tasks: nextTasks,
        activities: sliceActs([
          activity('task', 'Task updated', rest.title || id),
          ...state.activities,
        ]),
      }
    }
    case 'DELETE_TASK': {
      const id = action.payload
      const prev = state.tasks.find((t) => t.id === id)
      const nextTasks = state.tasks.filter((t) => t.id !== id)
      let projects = state.projects
      if (prev) {
        projects = recalcProjectProgress(projects, nextTasks, prev.projectId)
      }
      return {
        ...state,
        projects,
        tasks: nextTasks,
        activities: sliceActs([
          activity('task', 'Task deleted', id),
          ...state.activities,
        ]),
      }
    }
    case 'MOVE_TASK': {
      const { id, status } = action.payload
      const prev = state.tasks.find((t) => t.id === id)
      const nextTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, status } : t,
      )
      let projects = state.projects
      if (prev) {
        projects = recalcProjectProgress(projects, nextTasks, prev.projectId)
      }
      return {
        ...state,
        projects,
        tasks: nextTasks,
        activities: sliceActs([
          activity('task', 'Task moved', `${prev?.title || id} → ${status}`),
          ...state.activities,
        ]),
      }
    }
    case 'ADD_MEMBER': {
      const m = {
        id: uid(),
        name: action.payload.name,
        role: action.payload.role || '',
        email: action.payload.email || '',
      }
      return {
        ...state,
        members: [...state.members, m],
        activities: sliceActs([
          activity('member', 'Member added', m.name),
          ...state.activities,
        ]),
      }
    }
    case 'UPDATE_MEMBER': {
      const { id, ...rest } = action.payload
      return {
        ...state,
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...rest } : m,
        ),
        activities: sliceActs([
          activity('member', 'Member updated', rest.name || id),
          ...state.activities,
        ]),
      }
    }
    case 'DELETE_MEMBER': {
      const id = action.payload
      return {
        ...state,
        members: state.members.filter((m) => m.id !== id),
        tasks: state.tasks.map((t) =>
          t.assigneeId === id ? { ...t, assigneeId: null } : t,
        ),
        activities: sliceActs([
          activity('member', 'Member removed', id),
          ...state.activities,
        ]),
      }
    }
    case 'RESET': {
      return { ...initialState }
    }
    default:
      return state
  }
}

export function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

export function persistState(slice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
  } catch {
    /* ignore quota */
  }
}
