export default function Input({ label, id, className = '', ...rest }) {
  const inputId = id || rest.name
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
        {...rest}
      />
    </label>
  )
}
