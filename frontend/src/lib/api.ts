const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://salary-management-incubyte.fly.dev'

export interface Employee {
  id: string
  full_name: string
  email: string
  job_title: string
  department: string
  country: string
  salary_cents: number
  employment_type: string
  hire_date: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface EmployeePage {
  items: Employee[]
  total: number
  page: number
  page_size: number
}

export interface ListEmployeesParams {
  page?: number
  page_size?: number
  q?: string
  country?: string
  department?: string
}

function buildQueryString(params: ListEmployeesParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function listEmployees(params: ListEmployeesParams): Promise<EmployeePage> {
  const response = await fetch(`${BASE_URL}/employees${buildQueryString(params)}`)
  if (!response.ok) {
    throw new Error(`Failed to list employees: ${response.status}`)
  }
  return (await response.json()) as EmployeePage
}
