import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'

import { useEmployees } from './queries'
import { server } from '../../mocks/server'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useEmployees', () => {
  it('returns the employees page from the backend', async () => {
    server.use(
      http.get('*/employees', () => {
        return HttpResponse.json({
          items: [
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
          total: 1,
          page: 1,
          page_size: 50,
        })
      }),
    )

    const { result } = renderHook(() => useEmployees(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(1)
    expect(result.current.data?.items[0].full_name).toBe('Grace Hopper')
  })
})
