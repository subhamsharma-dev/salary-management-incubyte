import { useNavigate } from '@tanstack/react-router'

import { type CreateEmployeeInput } from '@/lib/api'

import { useCreateEmployee } from '../queries'
import { EmployeeForm } from './EmployeeForm'

export function EmployeeNewPage() {
  const navigate = useNavigate()
  const createMutation = useCreateEmployee()

  function handleSubmit(input: CreateEmployeeInput) {
    createMutation.mutate(input, {
      onSuccess: () => navigate({ to: '/employees', search: { page: 1 } }),
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">New employee</h2>
      <EmployeeForm
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        error={createMutation.error?.message ?? null}
      />
    </div>
  )
}
