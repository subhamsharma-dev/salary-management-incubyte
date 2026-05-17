import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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

  useEffect(() => {
    if (!data) return
    const lastPage = Math.max(1, Math.ceil(data.total / data.page_size))
    if (page > lastPage) {
      navigate({
        to: '/employees',
        search: buildSearch({ page: lastPage, q, country, department }),
      })
    }
  }, [page, data, navigate, q, country, department])

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'full_name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'job_title', header: 'Job title' },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ getValue }) => humanize(getValue() as string),
      },
      { accessorKey: 'country', header: 'Country' },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.original.full_name}`}
            onClick={() => setDeleteCandidate(row.original)}
          >
            <Trash2 />
          </Button>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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

  const lastPage = Math.max(1, Math.ceil(data.total / data.page_size))
  const rangeStart = (page - 1) * data.page_size + 1
  const rangeEnd = Math.min(page * data.page_size, data.total)

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          autoFocus
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === 'actions' ? 'w-12' : undefined}
                    aria-label={header.column.id === 'actions' ? 'Actions' : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.id === 'actions' ? 'text-right' : undefined}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.total === 0
            ? 'No employees match the current filters.'
            : `Showing ${rangeStart}–${rangeEnd} of ${data.total}`}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={page <= 1}
            onClick={() =>
              navigate({
                to: '/employees',
                search: buildSearch({ page: page - 1, q, country, department }),
              })
            }
          >
            <ChevronLeft /> Previous
          </Button>
          <Button
            disabled={page >= lastPage}
            onClick={() =>
              navigate({
                to: '/employees',
                search: buildSearch({ page: page + 1, q, country, department }),
              })
            }
          >
            Next <ChevronRight />
          </Button>
        </div>
      </div>
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
