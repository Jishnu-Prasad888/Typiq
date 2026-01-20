import { API } from './index'

declare global {
  interface Window {
    api: API
  }
}

// Export types for components
export * from './index'
