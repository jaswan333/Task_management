import { useContext, useMemo } from 'react'
import { PMSContext } from './context.js'
import { fetchWithAuth } from '../api/client.js'

export function usePMS() {
  const ctx = useContext(PMSContext)
  if (!ctx) throw new Error('usePMS must be used within PMSProvider')
  return ctx
}

export function usePMSActions() {
  const { dispatch, refreshData } = usePMS()

  return useMemo(
    () => ({
      addProject: async (payload) => {
        dispatch({ type: 'ADD_PROJECT', payload })
        await fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(payload) })
        refreshData()
      },
      updateProject: async (payload) => {
        dispatch({ type: 'UPDATE_PROJECT', payload })
        await fetchWithAuth(`/projects/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        refreshData()
      },
      deleteProject: async (id) => {
        dispatch({ type: 'DELETE_PROJECT', payload: id })
        await fetchWithAuth(`/projects/${id}`, { method: 'DELETE' })
        refreshData()
      },
      addTask: async (payload) => {
        dispatch({ type: 'ADD_TASK', payload })
        await fetchWithAuth('/tasks', { method: 'POST', body: JSON.stringify(payload) })
        refreshData()
      },
      updateTask: async (payload) => {
        dispatch({ type: 'UPDATE_TASK', payload })
        await fetchWithAuth(`/tasks/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        refreshData()
      },
      deleteTask: async (id) => {
        dispatch({ type: 'DELETE_TASK', payload: id })
        await fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' })
        refreshData()
      },
      moveTask: async (id, status) => {
        dispatch({ type: 'MOVE_TASK', payload: { id, status } })
        await fetchWithAuth(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
        refreshData()
      },
      addMember: async (payload) => {
        try {
          const newUser = await fetchWithAuth('/users', {
            method: 'POST',
            body: JSON.stringify({
              name: payload.name,
              email: payload.email,
              jobRole: payload.role || ''
            })
          })
          // Hydrate with the returned user so UI updates immediately
          dispatch({ type: 'ADD_MEMBER', payload: { ...newUser, role: newUser.jobRole } })
          refreshData()
        } catch (e) {
          console.error('Failed to create member:', e)
          alert(e.message || 'Failed to add member. Check the email is not already used.')
        }
      },
      updateMember: async (payload) => {
        dispatch({ type: 'UPDATE_MEMBER', payload })
        await fetchWithAuth(`/users/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        refreshData()
      },
      deleteMember: async (id) => {
        dispatch({ type: 'DELETE_MEMBER', payload: id })
        await fetchWithAuth(`/users/${id}`, { method: 'DELETE' })
        refreshData()
      },
      resetAll: () => dispatch({ type: 'RESET' }),
      importData: (payload) => dispatch({ type: 'HYDRATE', payload }),
    }),
    [dispatch, refreshData],
  )
}

/** @param {string} projectId */
export function useProjectTasks(projectId) {
  const { state } = usePMS()
  return useMemo(
    () => state.tasks.filter((t) => t.projectId === projectId),
    [state.tasks, projectId],
  )
}

/**
 * @param {string} query
 * @param {{ memberId?: string | null }} [options] When set, scopes results to member-visible work.
 */
export function useSearchResults(query, options) {
  const { state } = usePMS()
  const q = query.trim().toLowerCase()
  const memberId = options?.memberId ?? null

  return useMemo(() => {
    if (!q) return { projects: [], tasks: [] }

    const projectMatch = (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))

    const taskMatch = (t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))

    const projects = state.projects.filter((p) => {
      if (!projectMatch(p)) return false
      if (!memberId) return true
      return state.tasks.some(
        (t) =>
          t.projectId === p.id &&
          (t.assigneeId === memberId || t.assigneeId === null),
      )
    })

    const tasks = state.tasks.filter((t) => {
      if (!taskMatch(t)) return false
      if (!memberId) return true
      return t.assigneeId === memberId || t.assigneeId === null
    })

    return { projects, tasks }
  }, [state.projects, state.tasks, q, memberId])
}
