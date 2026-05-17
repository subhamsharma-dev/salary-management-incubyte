import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Polyfills for Radix UI primitives that depend on DOM APIs jsdom doesn't ship.
Element.prototype.hasPointerCapture = vi.fn(() => false)
Element.prototype.releasePointerCapture = vi.fn()
Element.prototype.scrollIntoView = vi.fn()
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
