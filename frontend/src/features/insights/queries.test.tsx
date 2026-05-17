import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'

import { server } from '../../mocks/server'
import { useInsightsByCountry, useInsightsByCountryJobTitle } from './queries'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('insights hooks', () => {
  it('useInsightsByCountry fetches data', async () => {
    server.use(
      http.get('*/insights/by-country', () =>
        HttpResponse.json([
          {
            country: 'US',
            headcount: 1000,
            min_salary_cents: 5_000_000,
            max_salary_cents: 30_000_000,
            avg_salary_cents: 12_000_000,
            median_salary_cents: 11_000_000,
            p25_salary_cents: 9_000_000,
            p75_salary_cents: 15_000_000,
          },
        ]),
      ),
    )

    const { result } = renderHook(() => useInsightsByCountry(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].country).toBe('US')
  })

  it('useInsightsByCountryJobTitle fetches data', async () => {
    server.use(
      http.get('*/insights/by-country-job-title', () =>
        HttpResponse.json([
          {
            country: 'GB',
            job_title: 'Engineer',
            headcount: 25,
            avg_salary_cents: 11_000_000,
          },
        ]),
      ),
    )

    const { result } = renderHook(() => useInsightsByCountryJobTitle(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].job_title).toBe('Engineer')
  })
})
