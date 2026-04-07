const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
