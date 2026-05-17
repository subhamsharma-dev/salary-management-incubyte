import { useNavigate, useParams } from '@tanstack/react-router'

import { type CreateEmployeeInput } from '@/lib/api'

import { useEmployee, useUpdateEmployee } from '../queries'
import { EmployeeForm } from './EmployeeForm'

export function EmployeeEditPage() {
  const { id } = useParams({ from: '/employees/$id/edit' })
  const navigate = useNavigate()
  const { data, isPending, isError } = useEmployee(id)
  const updateMutation = useUpdateEmployee()

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Failed to load employee.</p>

  const defaults: CreateEmployeeInput = {
    full_name: data.full_name,
    email: data.email,
    job_title: data.job_title,
    department: data.department,
    country: data.country,
    salary_cents: data.salary_cents,
    employment_type: data.employment_type,
    hire_date: data.hire_date,
  }

  function handleSubmit(input: CreateEmployeeInput) {
    updateMutation.mutate(
      { id, input },
      { onSuccess: () => navigate({ to: '/employees/$id', params: { id } }) },
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Edit employee</h2>
      <EmployeeForm
        defaultValues={defaults}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        error={updateMutation.error?.message ?? null}
      />
    </div>
  )
}
