import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'

import { server } from '../../../mocks/server'
import { createTestRouter } from '../../../test/createTestRouter'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('EmployeeListPage', () => {
  it('renders a row for each employee from the hook', async () => {
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
            {
              id: '22222222-2222-2222-2222-222222222222',
              full_name: 'Grace Hopper',
              email: 'grace@example.com',
              job_title: 'Admiral',
              department: 'engineering',
              country: 'US',
              salary_cents: 15_000_000,
              employment_type: 'full_time',
              hire_date: '2024-02-01',
              is_deleted: false,
              created_at: '2024-02-01T00:00:00Z',
              updated_at: '2024-02-01T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          page_size: 50,
        })
      }),
    )

    const testRouter = createTestRouter(['/employees'])
    render(<RouterProvider router={testRouter} />, { wrapper })

    await waitFor(() =>
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument(),
    )
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admiral')).toBeInTheDocument()
  })

  it('reads page from URL and navigates on Next click', async () => {
    let receivedPage: string | null = null
    server.use(
      http.get('*/employees', ({ request }) => {
        receivedPage = new URL(request.url).searchParams.get('page')
        const page = Number(receivedPage ?? '1')
        return HttpResponse.json({
          items: [
            {
              id: `00000000-0000-0000-0000-00000000000${page}`,
              full_name: `Employee Page ${page}`,
              email: `p${page}@example.com`,
              job_title: 'Engineer',
              department: 'engineering',
              country: 'GB',
              salary_cents: 10_000_000,
              employment_type: 'full_time',
              hire_date: '2024-01-01',
              is_deleted: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          total: 150,
          page,
          page_size: 50,
        })
      }),
    )

    const testRouter = createTestRouter(['/employees?page=2'])

    render(<RouterProvider router={testRouter} />, { wrapper })

    await waitFor(() => expect(receivedPage).toBe('2'))
    expect(await screen.findByText('Employee Page 2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    await waitFor(() => expect(receivedPage).toBe('3'))
  })

  it('debounces search input and sets q on URL', async () => {
    let receivedQ: string | null = null
    server.use(
      http.get('*/employees', ({ request }) => {
        receivedQ = new URL(request.url).searchParams.get('q')
        return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 50 })
      }),
    )

    const testRouter = createTestRouter(['/employees?page=1'])
    render(<RouterProvider router={testRouter} />, { wrapper })

    const searchInput = await screen.findByRole('searchbox')
    await userEvent.type(searchInput, 'ada')

    await waitFor(() => expect(receivedQ).toBe('ada'), { timeout: 1000 })
  })
})
