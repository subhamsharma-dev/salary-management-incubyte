import { useNavigate, useSearch } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Employee } from '@/lib/api'

import { useDeleteEmployee, useEmployees } from '../queries'
import { buildSearch } from '../searchSchema'

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

function humanize(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function EmployeeListPage() {
  const { page, q, country, department } = useSearch({ from: '/employees' })
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState(q ?? '')
  const [deleteCandidate, setDeleteCandidate] = useState<Employee | null>(null)
  const { data, isPending, isError } = useEmployees({ page, q, country, department })
  const deleteMutation = useDeleteEmployee()

  useEffect(() => {
    if (searchText === (q ?? '')) return
    const handle = setTimeout(() => {
      navigate({
        to: '/employees',
        search: buildSearch({ q: searchText, country, department }),
      })
    }, 300)
    return () => clearTimeout(handle)
  }, [searchText, q, country, department, navigate])

  function selectCountry(value: string) {
    navigate({
      to: '/employees',
      search: buildSearch({
        q,
        country: value !== 'all' ? value : undefined,
        department,
      }),
    })
  }

  function selectDepartment(value: string) {
    navigate({
      to: '/employees',
      search: buildSearch({
        q,
        country,
        department: value !== 'all' ? value : undefined,
      }),
    })
  }

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Failed to load employees.</p>

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />
        <Select value={country ?? 'all'} onValueChange={selectCountry}>
          <SelectTrigger className="w-[180px]" aria-label="Country">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {COUNTRIES.map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={department ?? 'all'} onValueChange={selectDepartment}>
          <SelectTrigger className="w-[180px]" aria-label="Department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {humanize(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="w-12" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.full_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.job_title}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.country}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${employee.full_name}`}
                    onClick={() => setDeleteCandidate(employee)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Button
        onClick={() =>
          navigate({
            to: '/employees',
            search: buildSearch({ page: page + 1, q, country, department }),
          })
        }
      >
        Next
      </Button>
      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate ? `${deleteCandidate.full_name} will be removed.` : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteCandidate) {
                  deleteMutation.mutate(deleteCandidate.id)
                  setDeleteCandidate(null)
                }
              }}
            >
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
