import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Layout } from './Layout'

describe('Layout', () => {
  it('renders the app title and its children', () => {
    render(
      <Layout>
        <div>child-content</div>
      </Layout>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /salary management/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('child-content')).toBeInTheDocument()
  })
})
