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

export async function listEmployees(): Promise<EmployeePage> {
  const response = await fetch(`${BASE_URL}/employees`)
  if (!response.ok) {
    throw new Error(`Failed to list employees: ${response.status}`)
  }
  return (await response.json()) as EmployeePage
}
