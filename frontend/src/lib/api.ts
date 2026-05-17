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

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete employee: ${response.status}`)
  }
}

export interface CreateEmployeeInput {
  full_name: string
  email: string
  job_title: string
  department: string
  country: string
  salary_cents: number
  employment_type: string
  hire_date: string
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>

export async function getEmployee(id: string): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to get employee: ${response.status}`)
  }
  return (await response.json()) as Employee
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create employee: ${response.status}`)
  }
  return (await response.json()) as Employee
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to update employee: ${response.status}`)
  }
  return (await response.json()) as Employee
}
