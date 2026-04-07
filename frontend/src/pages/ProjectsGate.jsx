import { useAuth } from '../auth/useAuth.js'
import Projects from './Projects.jsx'
import MemberProjects from './MemberProjects.jsx'

export default function ProjectsGate() {
  const { isMember } = useAuth()
  if (isMember) return <MemberProjects />
  return <Projects />
}
