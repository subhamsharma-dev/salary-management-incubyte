import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type CreateEmployeeInput } from '@/lib/api'

const COUNTRIES = ['US', 'GB', 'IN', 'DE', 'FR', 'JP', 'BR', 'AU', 'CA', 'MX']
const DEPARTMENTS = [
  'engineering',
  'sales',
  'marketing',
  'human_resources',
  'finance',
  'operations',
  'customer_support',
  'product',
]
const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contractor']

function humanize(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface EmployeeFormProps {
  defaultValues?: CreateEmployeeInput
  onSubmit: (input: CreateEmployeeInput) => void
  submitting?: boolean
  error?: string | null
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  submitting,
  error,
}: EmployeeFormProps) {
  const [fullName, setFullName] = useState(defaultValues?.full_name ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [jobTitle, setJobTitle] = useState(defaultValues?.job_title ?? '')
  const [department, setDepartment] = useState(defaultValues?.department ?? 'engineering')
  const [country, setCountry] = useState(defaultValues?.country ?? 'US')
  const [salaryDollars, setSalaryDollars] = useState(
    defaultValues ? String(defaultValues.salary_cents / 100) : '',
  )
  const [employmentType, setEmploymentType] = useState(
    defaultValues?.employment_type ?? 'full_time',
  )
  const [hireDate, setHireDate] = useState(defaultValues?.hire_date ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit({
      full_name: fullName,
      email,
      job_title: jobTitle,
      department,
      country,
      salary_cents: Math.round(Number(salaryDollars) * 100),
      employment_type: employmentType,
      hire_date: hireDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="full_name" className="text-sm font-medium">
          Full name
        </label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="job_title" className="text-sm font-medium">
          Job title
        </label>
        <Input
          id="job_title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="department" className="text-sm font-medium">
          Department
        </label>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger id="department">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {humanize(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger id="country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="salary" className="text-sm font-medium">
          Salary (USD)
        </label>
        <Input
          id="salary"
          type="number"
          min="1"
          value={salaryDollars}
          onChange={(e) => setSalaryDollars(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="employment_type" className="text-sm font-medium">
          Employment type
        </label>
        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger id="employment_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {humanize(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label htmlFor="hire_date" className="text-sm font-medium">
          Hire date
        </label>
        <Input
          id="hire_date"
          type="date"
          value={hireDate}
          onChange={(e) => setHireDate(e.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting}>
        Save
      </Button>
    </form>
  )
}
