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

describe('EmployeeEditPage', () => {
  it('prefills form and submits PATCH on save', async () => {
    let patchBody: unknown = null
    let patchUrl = ''
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
      http.patch('*/employees/:id', async ({ request }) => {
        patchUrl = request.url
        patchBody = await request.json()
        return HttpResponse.json({
          id: '11111111-1111-1111-1111-111111111111',
          full_name: 'Ada Lovelace',
          email: 'ada.new@example.com',
          job_title: 'Engineer',
          department: 'engineering',
          country: 'GB',
          salary_cents: 12_000_000,
          employment_type: 'full_time',
          hire_date: '2024-01-15',
          is_deleted: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-05-18T00:00:00Z',
        })
      }),
    )

    const testRouter = createTestRouter([
      '/employees/11111111-1111-1111-1111-111111111111/edit',
    ])
    render(<RouterProvider router={testRouter} />, { wrapper })

    await waitFor(() =>
      expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace'),
    )
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')

    await userEvent.clear(screen.getByLabelText('Email'))
    await userEvent.type(screen.getByLabelText('Email'), 'ada.new@example.com')

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect((patchBody as { email: string } | null)?.email).toBe(
        'ada.new@example.com',
      ),
    )
    expect(patchUrl).toContain('/employees/11111111-1111-1111-1111-111111111111')
  })
})
