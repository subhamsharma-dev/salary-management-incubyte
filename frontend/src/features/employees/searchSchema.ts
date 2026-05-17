export interface EmployeesSearch {
  page: number
}

export function employeesSearchSchema(search: Record<string, unknown>): EmployeesSearch {
  return {
    page: Number(search.page) || 1,
  }
}
