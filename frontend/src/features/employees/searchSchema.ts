export interface EmployeesSearch {
  page: number
  q?: string
  country?: string
}

export function employeesSearchSchema(search: Record<string, unknown>): EmployeesSearch {
  const q = typeof search.q === 'string' && search.q.length > 0 ? search.q : undefined
  const country = typeof search.country === 'string' && search.country.length > 0 ? search.country : undefined
  return {
    page: Number(search.page) || 1,
    ...(q !== undefined ? { q } : {}),
    ...(country !== undefined ? { country } : {}),
  }
}

export function buildSearch(updates: Partial<EmployeesSearch>): EmployeesSearch {
  return {
    page: updates.page ?? 1,
    ...(updates.q && updates.q.length > 0 ? { q: updates.q } : {}),
    ...(updates.country && updates.country.length > 0 ? { country: updates.country } : {}),
  }
}
