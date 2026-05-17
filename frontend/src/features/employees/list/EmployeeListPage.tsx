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
  const { data, isPending, isError } = useEmployees({})

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Failed to load employees.</p>

  return (
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
  )
}
