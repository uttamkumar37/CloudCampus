interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
  helperText?: string
  disabled?: boolean
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  helperText,
  disabled = false,
}: FormSelectProps) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="cc-input appearance-none pr-10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </label>
  )
}
