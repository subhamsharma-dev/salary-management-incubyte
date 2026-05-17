import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'

import { Layout } from './components/Layout'
import { EmployeeDetailPage } from './features/employees/edit/EmployeeDetailPage'
import { EmployeeEditPage } from './features/employees/edit/EmployeeEditPage'
import { EmployeeNewPage } from './features/employees/edit/EmployeeNewPage'
import { EmployeeListPage } from './features/employees/list/EmployeeListPage'
import { employeesSearchSchema } from './features/employees/searchSchema'
import { InsightsPage } from './features/insights/InsightsPage'

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
  component: EmployeeNewPage,
})

const employeeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id',
  component: EmployeeDetailPage,
})

const employeeEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees/$id/edit',
  component: EmployeeEditPage,
})

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/insights',
  component: InsightsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  employeesNewRoute,
  employeeDetailRoute,
  employeeEditRoute,
  insightsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
