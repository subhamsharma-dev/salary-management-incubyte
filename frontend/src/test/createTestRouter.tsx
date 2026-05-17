import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { EmployeeDetailPage } from '../features/employees/edit/EmployeeDetailPage'
import { EmployeeListPage } from '../features/employees/list/EmployeeListPage'
import { employeesSearchSchema } from '../features/employees/searchSchema'

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
    component: () => <p>New stub</p>,
  })

  const employeeDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/employees/$id',
    component: EmployeeDetailPage,
  })

  const employeeEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/employees/$id/edit',
    component: () => <p>Edit stub</p>,
  })

  return createRouter({
    routeTree: rootRoute.addChildren([
      employeesRoute,
      employeesNewRoute,
      employeeDetailRoute,
      employeeEditRoute,
    ]),
    history: createMemoryHistory({ initialEntries }),
  })
}
