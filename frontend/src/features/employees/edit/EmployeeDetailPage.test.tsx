import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
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

describe('EmployeeDetailPage', () => {
  it('renders employee details and navigates to edit on Edit click', async () => {
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

    const testRouter = createTestRouter([
      '/employees/11111111-1111-1111-1111-111111111111',
    ])
    render(<RouterProvider router={testRouter} />, { wrapper })

    await screen.findByText('Ada Lovelace')
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('$120,000')).toBeInTheDocument()
    expect(screen.getByText('Full Time')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    await screen.findByText('Edit employee')
  })
})
