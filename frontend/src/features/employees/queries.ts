import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
  type CreateEmployeeInput,
  type Employee,
  type EmployeePage,
  type ListEmployeesParams,
  type UpdateEmployeeInput,
} from '@/lib/api'

export function useEmployees(params: ListEmployeesParams) {
  return useQuery<EmployeePage>({
    queryKey: ['employees', params],
    queryFn: () => listEmployees(params),
    placeholderData: keepPreviousData,
  })
}

export function useEmployee(id: string) {
  return useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id),
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

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      updateEmployee(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}
