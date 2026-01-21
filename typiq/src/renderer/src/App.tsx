import { useState, useEffect, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import FontExplorer from './components/FontExplorer'
import FontComparator from './components/FontComparator'
import Bookmarks from './components/Bookmarks'
import Settings from './components/Settings'
import { FontCacheProvider } from './contexts/FontCacheContext'
import ErrorBoundary from '../src/components/ErrorBoundary'

function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <FontCacheProvider>
      <div className="flex h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full bg-bg-primary">
                  <div className="text-center">
                    <div className="relative w-14 h-14 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-border-primary animate-spin-slow border-t-accent-blue"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-accent-blue animate-spin border-t-accent-white"></div>
                    </div>
                    <p className="text-text-secondary text-sm">
                      Loading application<span className="animate-pulse">...</span>
                    </p>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/explorer" replace />} />
                <Route path="/explorer" element={<FontExplorer />} />
                <Route path="/compare" element={<FontComparator />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route
                  path="/settings"
                  element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'glass-panel',
            style: {
              background: 'var(--tw-bg-secondary)',
              color: 'var(--tw-text-primary)',
              border: '1px solid var(--tw-border-primary)'
            }
          }}
        />
      </div>
    </FontCacheProvider>
  )
}

export default App
