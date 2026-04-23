import { useState } from 'react'
import type { FormEvent } from 'react'

import { FormInput } from '../../../components/ui/FormInput'
import { FormSelect } from '../../../components/ui/FormSelect'

import type { CreateStudentRequest, Gender } from '../types'

interface StudentFormProps {
  onSubmit: (payload: CreateStudentRequest) => Promise<boolean>
  isSubmitting: boolean
}

const genderOptions: Array<{ value: Gender | ''; label: string }> = [
  { value: '', label: 'Select gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export function StudentForm({ onSubmit, isSubmitting }: StudentFormProps) {
  const [values, setValues] = useState<CreateStudentRequest>({
    admissionNo: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    phone: '',
  })

  const [selectedGender, setSelectedGender] = useState<Gender | ''>('MALE')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const created = await onSubmit({
      ...values,
      gender: selectedGender || 'MALE',
      email: (values.email ?? '').trim() || null,
      phone: (values.phone ?? '').trim() || null,
    })

    if (!created) {
      return
    }

    setValues({
      admissionNo: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      email: '',
      phone: '',
    })
    setSelectedGender('MALE')
  }

  return (
    <form className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-semibold text-slate-900">Create Student</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          label="Admission No"
          value={values.admissionNo}
          onChange={(value) => setValues((previous) => ({ ...previous, admissionNo: value }))}
          placeholder="ADM-1001"
          required
        />
        <FormInput
          label="Date of Birth"
          type="date"
          value={values.dateOfBirth}
          onChange={(value) => setValues((previous) => ({ ...previous, dateOfBirth: value }))}
          required
        />
        <FormInput
          label="First Name"
          value={values.firstName}
          onChange={(value) => setValues((previous) => ({ ...previous, firstName: value }))}
          required
        />
        <FormInput
          label="Last Name"
          value={values.lastName}
          onChange={(value) => setValues((previous) => ({ ...previous, lastName: value }))}
          required
        />
        <FormSelect
          label="Gender"
          value={selectedGender}
          onChange={(value) => setSelectedGender(value as Gender | '')}
          options={genderOptions}
          required
        />
        <FormInput
          label="Phone"
          value={values.phone ?? ''}
          onChange={(value) => setValues((previous) => ({ ...previous, phone: value }))}
          placeholder="+91-9999999999"
        />
        <FormInput
          label="Email"
          type="email"
          value={values.email ?? ''}
          onChange={(value) => setValues((previous) => ({ ...previous, email: value }))}
          placeholder="student@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400 md:w-auto"
      >
        {isSubmitting ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  )
}
