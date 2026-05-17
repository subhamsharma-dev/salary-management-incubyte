import { useQuery } from '@tanstack/react-query'

import { listEmployees, type EmployeePage } from '@/lib/api'

export function useEmployees() {
  return useQuery<EmployeePage>({
    queryKey: ['employees'],
    queryFn: listEmployees,
  })
}
