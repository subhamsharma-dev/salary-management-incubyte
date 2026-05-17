import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { EmployeeForm } from './EmployeeForm'

describe('EmployeeForm', () => {
  it('submits with salary in cents when user fills fields', async () => {
    const onSubmit = vi.fn()
    render(<EmployeeForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Job title'), 'Engineer')
    await userEvent.type(screen.getByLabelText('Salary (USD)'), '120000')
    fireEvent.change(screen.getByLabelText('Hire date'), {
      target: { value: '2024-01-15' },
    })

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      full_name: 'Ada Lovelace',
      email: 'ada@example.com',
      job_title: 'Engineer',
      department: 'engineering',
      country: 'US',
      salary_cents: 12_000_000,
      employment_type: 'full_time',
      hire_date: '2024-01-15',
    })
  })

  it('prefills fields when defaultValues provided', () => {
    render(
      <EmployeeForm
        onSubmit={() => {}}
        defaultValues={{
          full_name: 'Grace Hopper',
          email: 'grace@example.com',
          job_title: 'Admiral',
          department: 'sales',
          country: 'GB',
          salary_cents: 15_000_000,
          employment_type: 'contractor',
          hire_date: '2023-06-15',
        }}
      />,
    )

    expect(screen.getByLabelText('Full name')).toHaveValue('Grace Hopper')
    expect(screen.getByLabelText('Email')).toHaveValue('grace@example.com')
    expect(screen.getByLabelText('Job title')).toHaveValue('Admiral')
    expect(screen.getByLabelText('Salary (USD)')).toHaveValue(150000)
    expect(screen.getByLabelText('Hire date')).toHaveValue('2023-06-15')
  })
})
