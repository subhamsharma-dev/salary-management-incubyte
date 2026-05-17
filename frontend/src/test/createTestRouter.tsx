import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { EmployeeDetailPage } from '../features/employees/edit/EmployeeDetailPage'
import { EmployeeEditPage } from '../features/employees/edit/EmployeeEditPage'
import { EmployeeNewPage } from '../features/employees/edit/EmployeeNewPage'
import { EmployeeListPage } from '../features/employees/list/EmployeeListPage'
import { employeesSearchSchema } from '../features/employees/searchSchema'
import { InsightsPage } from '../features/insights/InsightsPage'

export function createTestRouter(initialEntries: string[]) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })

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

  return createRouter({
    routeTree: rootRoute.addChildren([
      employeesRoute,
      employeesNewRoute,
      employeeDetailRoute,
      employeeEditRoute,
      insightsRoute,
    ]),
    history: createMemoryHistory({ initialEntries }),
  })
}
