import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

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

  return createRouter({
    routeTree: rootRoute.addChildren([employeesRoute]),
    history: createMemoryHistory({ initialEntries }),
  })
}
