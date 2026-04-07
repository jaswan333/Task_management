/** Projects where the member has assigned work or can pick unassigned tasks. */
export function projectsForMember(state, memberId) {
  return state.projects.filter((p) =>
    state.tasks.some(
      (t) =>
        t.projectId === p.id &&
        (t.assigneeId === memberId || t.assigneeId === null),
    ),
  )
}

export function memberCanAccessProject(state, projectId, memberId) {
  return state.tasks.some(
    (t) =>
      t.projectId === projectId &&
      (t.assigneeId === memberId || t.assigneeId === null),
  )
}
