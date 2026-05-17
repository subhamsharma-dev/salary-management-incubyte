import { http, HttpResponse } from 'msw'
import { describe, it, expect } from 'vitest'

import { listEmployees } from './api'
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
})
