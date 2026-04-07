const styles = {
  default: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-100 text-indigo-800',
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-sky-100 text-sky-900',
}

export default function Badge({ children, tone = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
