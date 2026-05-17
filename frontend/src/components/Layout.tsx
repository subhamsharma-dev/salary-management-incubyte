import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Salary Management</h1>
      {children}
    </main>
  )
}
