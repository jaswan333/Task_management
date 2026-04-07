import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { usePMS } from '../pms/usePMS.js'
import { projectsForMember } from '../pms/memberAccess.js'
import { formatDate, projectStatusLabel } from '../pms/labels.js'
import Card from '../components/pms/Card.jsx'
import Badge from '../components/pms/Badge.jsx'

export default function MemberProjects() {
  const { memberId } = useAuth()
  const { state } = usePMS()
  const list = projectsForMember(state, memberId)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <p className="text-sm text-slate-600">
        Projects where you have assigned work or open unassigned tasks you can pick up.
      </p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Project</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Window</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No projects yet — pick a task or create one to appear here.
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-2">
                      <span className="font-medium text-slate-900">{p.name}</span>
                      {p.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.description}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <Badge tone="default">{projectStatusLabel[p.status]}</Badge>
                    </td>
                    <td className="py-3 text-slate-600">
                      {formatDate(p.startDate)} – {formatDate(p.endDate)}
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
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
