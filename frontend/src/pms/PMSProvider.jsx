import { useEffect, useMemo, useReducer, useCallback } from 'react'
import { PMSContext } from './context.js'
import { initialState, pmsReducer } from './reducer.js'
import { fetchWithAuth } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'

export function PMSProvider({ children }) {
  const [state, dispatch] = useReducer(pmsReducer, initialState)
  const { session } = useAuth()

  const refreshData = useCallback(async () => {
    if (!session) return;
    try {
      const [projects, tasks, members, activities] = await Promise.all([
        fetchWithAuth('/projects'),
        fetchWithAuth('/tasks'),
        fetchWithAuth('/users'),
        fetchWithAuth('/activities')
      ]);

      // Remap _id to id if necessary
      const mapItem = (item) => ({ ...item, id: item._id });

      dispatch({
        type: 'HYDRATE',
        payload: {
          projects: projects.map(mapItem),
          tasks: tasks.map(mapItem),
          members: members.map(mapItem),
          activities: activities.map(mapItem)
        }
      });
    } catch(e) {
      console.error('Failed to fetch PMS data:', e);
    }
  }, [session]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = useMemo(() => ({ state, dispatch, refreshData }), [state, dispatch, refreshData])
  return <PMSContext.Provider value={value}>{children}</PMSContext.Provider>
}
