interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'date'
  placeholder?: string
  required?: boolean
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: FormInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
      />
    </label>
  )
}
