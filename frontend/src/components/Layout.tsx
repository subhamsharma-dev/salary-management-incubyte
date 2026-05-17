import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h1>Salary Management</h1>
      {children}
    </>
  )
}
