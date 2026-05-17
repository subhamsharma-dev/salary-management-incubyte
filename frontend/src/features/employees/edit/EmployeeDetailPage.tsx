import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, humanize } from '@/lib/format'

import { useDeleteEmployee, useEmployee } from '../queries'

export function EmployeeDetailPage() {
  const { id } = useParams({ from: '/employees/$id' })
  const navigate = useNavigate()
  const { data, isPending, isError } = useEmployee(id)
  const deleteMutation = useDeleteEmployee()
  const [showDelete, setShowDelete] = useState(false)

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Failed to load employee.</p>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{data.full_name}</h2>
      <Card className="p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd>{data.email}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Job title</dt>
          <dd>{data.job_title}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Department</dt>
          <dd>{humanize(data.department)}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Country</dt>
          <dd>{data.country}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Salary</dt>
          <dd>{formatCurrency(data.salary_cents)}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Employment type</dt>
          <dd>{humanize(data.employment_type)}</dd>
          <dt className="text-sm font-medium text-muted-foreground">Hire date</dt>
          <dd>{data.hire_date}</dd>
        </dl>
      </Card>
      <div className="flex gap-2">
        <Button onClick={() => navigate({ to: '/employees/$id/edit', params: { id } })}>
          Edit
        </Button>
        <Button variant="ghost" onClick={() => setShowDelete(true)}>
          Delete
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/employees', search: { page: 1 } })}
        >
          Back
        </Button>
      </div>
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              {data.full_name} will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteMutation.mutate(id, {
                  onSuccess: () => navigate({ to: '/employees', search: { page: 1 } }),
                })
                setShowDelete(false)
              }}
            >
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
