import { useQuery } from '@tanstack/react-query'

import { listEmployees, type EmployeePage, type ListEmployeesParams } from '@/lib/api'

export function useEmployees(params: ListEmployeesParams) {
  return useQuery<EmployeePage>({
    queryKey: ['employees', params],
    queryFn: () => listEmployees(params),
  })
}
