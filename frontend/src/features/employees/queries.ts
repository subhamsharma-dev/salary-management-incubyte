import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteEmployee,
  listEmployees,
  type EmployeePage,
  type ListEmployeesParams,
} from '@/lib/api'

export function useEmployees(params: ListEmployeesParams) {
  return useQuery<EmployeePage>({
    queryKey: ['employees', params],
    queryFn: () => listEmployees(params),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
