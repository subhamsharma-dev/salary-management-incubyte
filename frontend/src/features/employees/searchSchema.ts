export interface EmployeesSearch {
  page: number
  q?: string
  country?: string
  department?: string
}

export function employeesSearchSchema(search: Record<string, unknown>): EmployeesSearch {
  const q = typeof search.q === 'string' && search.q.length > 0 ? search.q : undefined
  const country = typeof search.country === 'string' && search.country.length > 0 ? search.country : undefined
  const department = typeof search.department === 'string' && search.department.length > 0 ? search.department : undefined
  return {
    page: Number(search.page) || 1,
    ...(q !== undefined ? { q } : {}),
    ...(country !== undefined ? { country } : {}),
    ...(department !== undefined ? { department } : {}),
  }
}

export function buildSearch(updates: Partial<EmployeesSearch>): EmployeesSearch {
  return {
    page: updates.page ?? 1,
    ...(updates.q && updates.q.length > 0 ? { q: updates.q } : {}),
    ...(updates.country && updates.country.length > 0 ? { country: updates.country } : {}),
    ...(updates.department && updates.department.length > 0 ? { department: updates.department } : {}),
  }
}
