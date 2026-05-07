interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'date' | 'password' | 'number' | 'time'
  placeholder?: string
  required?: boolean
  helperText?: string
  disabled?: boolean
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  helperText,
  disabled = false,
}: FormInputProps) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="cc-input disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </label>
  )
}
