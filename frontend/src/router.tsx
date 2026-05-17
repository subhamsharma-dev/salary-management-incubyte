import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'

import { Layout } from './components/Layout'
import { EmployeeListPage } from './features/employees/list/EmployeeListPage'
import { employeesSearchSchema } from './features/employees/searchSchema'

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/employees', search: { page: 1 } })
  },
})

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  validateSearch: employeesSearchSchema,
  component: EmployeeListPage,
})

const employeesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/new',
  component: () => <p>New employee — coming soon…</p>,
})

const employeeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id',
  component: () => <p>Employee detail — coming soon…</p>,
})

const employeeEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  component: () => <p>Employee edit — coming soon…</p>,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  employeesNewRoute,
  employeeDetailRoute,
  employeeEditRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
