import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'

import { useDeleteEmployee, useEmployees } from './queries'
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

    const { result } = renderHook(() => useEmployees({}), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(1)
    expect(result.current.data?.items[0].full_name).toBe('Grace Hopper')
  })

  it('passes search params to the backend', async () => {
    server.use(
      http.get('*/employees', ({ request }) => {
        const q = new URL(request.url).searchParams.get('q') ?? ''
        if (q === 'ada') {
          return HttpResponse.json({
            items: [
              {
                id: '33333333-3333-3333-3333-333333333333',
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
        }
        return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 50 })
      }),
    )

    const { result: ada } = renderHook(() => useEmployees({ q: 'ada' }), { wrapper })
    await waitFor(() => expect(ada.current.isSuccess).toBe(true))
    expect(ada.current.data?.items[0].full_name).toBe('Ada Lovelace')

    const { result: empty } = renderHook(() => useEmployees({ q: 'nobody' }), { wrapper })
    await waitFor(() => expect(empty.current.isSuccess).toBe(true))
    expect(empty.current.data?.items).toHaveLength(0)
  })

  it('invalidates employees query on delete success', async () => {
    let listCallCount = 0
    server.use(
      http.get('*/employees', () => {
        listCallCount++
        return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 50 })
      }),
      http.delete('*/employees/:id', () => new HttpResponse(null, { status: 204 })),
    )

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const sharedWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result: list } = renderHook(() => useEmployees({}), { wrapper: sharedWrapper })
    await waitFor(() => expect(list.current.isSuccess).toBe(true))
    const initialCount = listCallCount

    const { result: del } = renderHook(() => useDeleteEmployee(), { wrapper: sharedWrapper })
    del.current.mutate('11111111-1111-1111-1111-111111111111')

    await waitFor(() => expect(listCallCount).toBeGreaterThan(initialCount))
  })

  it('keeps previous data while fetching with new params', async () => {
    let callCount = 0
    server.use(
      http.get('*/employees', ({ request }) => {
        callCount++
        const q = new URL(request.url).searchParams.get('q') ?? ''
        return HttpResponse.json({
          items: [
            {
              id: `00000000-0000-0000-0000-${String(callCount).padStart(12, '0')}`,
              full_name: q || 'initial',
              email: 'x@example.com',
              job_title: 'X',
              department: 'engineering',
              country: 'GB',
              salary_cents: 0,
              employment_type: 'full_time',
              hire_date: '2024-01-01',
              is_deleted: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          page_size: 50,
        })
      }),
    )

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const sharedWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result, rerender } = renderHook(
      ({ q }) => useEmployees({ q }),
      { wrapper: sharedWrapper, initialProps: { q: 'grace' as string | undefined } },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items[0].full_name).toBe('grace')

    rerender({ q: 'ada' })

    expect(result.current.data?.items[0].full_name).toBe('grace')
    expect(result.current.isPending).toBe(false)

    await waitFor(() =>
      expect(result.current.data?.items[0].full_name).toBe('ada'),
    )
  })
})
