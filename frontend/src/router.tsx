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

const routeTree = rootRoute.addChildren([indexRoute, employeesRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
