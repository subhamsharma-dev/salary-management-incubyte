import { http, HttpResponse } from 'msw'
import { describe, it, expect } from 'vitest'

import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from './api'
import { server } from '../mocks/server'

describe('listEmployees', () => {
  it('fetches the employees page from the backend', async () => {
    server.use(
      http.get('*/employees', () => {
        return HttpResponse.json({
          items: [
            {
              id: '11111111-1111-1111-1111-111111111111',
              full_name: 'Ada Lovelace',
              email: 'ada@example.com',
              job_title: 'Engineer',
              department: 'engineering',
              country: 'GB',
              salary_cents: 12_000_000,
              employment_type: 'full_time',
              hire_date: '2024-01-15',
              is_deleted: false,
              created_at: '2024-01-15T00:00:00Z',
              updated_at: '2024-01-15T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          page_size: 50,
        })
      }),
    )

    const page = await listEmployees({})

    expect(page.total).toBe(1)
    expect(page.items).toHaveLength(1)
    expect(page.items[0].full_name).toBe('Ada Lovelace')
  })

  it('forwards params as query string', async () => {
    let capturedUrl = ''
    server.use(
      http.get('*/employees', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, page: 2, page_size: 25 })
      }),
    )

    await listEmployees({
      page: 2,
      page_size: 25,
      q: 'ada',
      country: 'GB',
      department: 'engineering',
    })

    expect(capturedUrl).toContain('page=2')
    expect(capturedUrl).toContain('page_size=25')
    expect(capturedUrl).toContain('q=ada')
    expect(capturedUrl).toContain('country=GB')
    expect(capturedUrl).toContain('department=engineering')
  })

  it('sends a DELETE for an employee id', async () => {
    let capturedMethod = ''
    let capturedUrl = ''
    server.use(
      http.delete('*/employees/:id', ({ request }) => {
        capturedMethod = request.method
        capturedUrl = request.url
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await deleteEmployee('11111111-1111-1111-1111-111111111111')

    expect(capturedMethod).toBe('DELETE')
    expect(capturedUrl).toContain('/employees/11111111-1111-1111-1111-111111111111')
  })

  it('fetches an employee by id', async () => {
    server.use(
      http.get('*/employees/:id', () =>
        HttpResponse.json({
          id: '11111111-1111-1111-1111-111111111111',
          full_name: 'Ada Lovelace',
          email: 'ada@example.com',
          job_title: 'Engineer',
          department: 'engineering',
          country: 'GB',
          salary_cents: 12_000_000,
          employment_type: 'full_time',
          hire_date: '2024-01-15',
          is_deleted: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        }),
      ),
    )

    const employee = await getEmployee('11111111-1111-1111-1111-111111111111')

    expect(employee.full_name).toBe('Ada Lovelace')
    expect(employee.email).toBe('ada@example.com')
  })

  it('creates an employee with POST payload', async () => {
    let capturedBody: unknown = null
    server.use(
      http.post('*/employees', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(
          {
            id: '22222222-2222-2222-2222-222222222222',
            full_name: 'New Hire',
            email: 'new@example.com',
            job_title: 'Engineer',
            department: 'engineering',
            country: 'US',
            salary_cents: 10_000_000,
            employment_type: 'full_time',
            hire_date: '2024-05-01',
            is_deleted: false,
            created_at: '2024-05-01T00:00:00Z',
            updated_at: '2024-05-01T00:00:00Z',
          },
          { status: 201 },
        )
      }),
    )

    const created = await createEmployee({
      full_name: 'New Hire',
      email: 'new@example.com',
      job_title: 'Engineer',
      department: 'engineering',
      country: 'US',
      salary_cents: 10_000_000,
      employment_type: 'full_time',
      hire_date: '2024-05-01',
    })

    expect(created.id).toBe('22222222-2222-2222-2222-222222222222')
    expect((capturedBody as { email: string }).email).toBe('new@example.com')
  })

  it('updates an employee with PATCH payload', async () => {
    let capturedBody: unknown = null
    let capturedUrl = ''
    server.use(
      http.patch('*/employees/:id', async ({ request }) => {
        capturedUrl = request.url
        capturedBody = await request.json()
        return HttpResponse.json({
          id: '11111111-1111-1111-1111-111111111111',
          full_name: 'Ada Lovelace',
          email: 'ada.new@example.com',
          job_title: 'Senior Engineer',
          department: 'engineering',
          country: 'GB',
          salary_cents: 15_000_000,
          employment_type: 'full_time',
          hire_date: '2024-01-15',
          is_deleted: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-05-18T00:00:00Z',
        })
      }),
    )

    const updated = await updateEmployee('11111111-1111-1111-1111-111111111111', {
      email: 'ada.new@example.com',
      job_title: 'Senior Engineer',
    })

    expect(updated.email).toBe('ada.new@example.com')
    expect(capturedUrl).toContain('/employees/11111111-1111-1111-1111-111111111111')
    expect((capturedBody as { job_title: string }).job_title).toBe('Senior Engineer')
  })
})
