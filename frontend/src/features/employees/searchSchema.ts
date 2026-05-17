export interface EmployeesSearch {
  page: number
  q?: string
}

export function employeesSearchSchema(search: Record<string, unknown>): EmployeesSearch {
  const q = typeof search.q === 'string' && search.q.length > 0 ? search.q : undefined
  return {
    page: Number(search.page) || 1,
    ...(q !== undefined ? { q } : {}),
  }
}
