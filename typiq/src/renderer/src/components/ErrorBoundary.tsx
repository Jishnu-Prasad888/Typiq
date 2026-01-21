// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-bg-primary">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl text-accent-red">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Something went wrong</h2>
            <p className="text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-3 rounded-full bg-accent-orange text-white font-semibold hover:bg-accent-gold transition-all duration-200"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
