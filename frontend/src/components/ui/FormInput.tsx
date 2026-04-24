import { Input } from './Input'

interface FormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'date' | 'password'
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
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}
