import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

describe('EmployeeNewPage', () => {
  it('submits form and POSTs to backend', async () => {
    let capturedBody: unknown = null
    server.use(
      http.get('*/employees', () =>
        HttpResponse.json({ items: [], total: 0, page: 1, page_size: 50 }),
      ),
      http.post('*/employees', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(
          {
            id: '99999999-9999-9999-9999-999999999999',
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

    const testRouter = createTestRouter(['/employees/new'])
    render(<RouterProvider router={testRouter} />, { wrapper })

    await screen.findByText('New employee')

    await userEvent.type(screen.getByLabelText('Full name'), 'New Hire')
    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com')
    await userEvent.type(screen.getByLabelText('Job title'), 'Engineer')
    await userEvent.type(screen.getByLabelText('Salary (USD)'), '100000')
    fireEvent.change(screen.getByLabelText('Hire date'), {
      target: { value: '2024-05-01' },
    })

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect((capturedBody as { email: string } | null)?.email).toBe('new@example.com'),
    )
    expect((capturedBody as { salary_cents: number }).salary_cents).toBe(10_000_000)
  })
})
