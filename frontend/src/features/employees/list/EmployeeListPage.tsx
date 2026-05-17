import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useEmployees } from '../queries'

export function EmployeeListPage() {
  const { page, q } = useSearch({ from: '/employees' })
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState(q ?? '')
  const { data, isPending, isError } = useEmployees({ page, q })

  useEffect(() => {
    if (searchText === (q ?? '')) return
    const handle = setTimeout(() => {
      navigate({
        to: '/employees',
        search: { page: 1, ...(searchText ? { q: searchText } : {}) },
      })
    }, 300)
    return () => clearTimeout(handle)
  }, [searchText, q, navigate])

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Failed to load employees.</p>

  return (
    <>
      <Input
        type="search"
        placeholder="Search…"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Job title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Country</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        onClick={() =>
          navigate({
            to: '/employees',
            search: { page: page + 1, ...(q !== undefined ? { q } : {}) },
          })
        }
      >
        Next
      </Button>
    </>
  )
}
