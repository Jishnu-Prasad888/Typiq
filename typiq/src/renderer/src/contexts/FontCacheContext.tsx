// contexts/FontCacheContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { FontInfo } from '../types/preload'

interface FontCacheContextType {
  fonts: FontInfo[]
  isLoading: boolean
  error: string | null
  loadFonts: (forceRefresh?: boolean) => Promise<FontInfo[]>
  clearCache: () => void
  getCachedFonts: () => FontInfo[]
}

const FontCacheContext = createContext<FontCacheContextType | undefined>(undefined)

export const useFontCache = () => {
  const context = useContext(FontCacheContext)
  if (!context) {
    throw new Error('useFontCache must be used within FontCacheProvider')
  }
  return context
}

export const FontCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fonts, setFonts] = useState<FontInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<{ fonts: FontInfo[]; timestamp: number } | null>(null)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

  const loadFonts = async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now()
    if (!forceRefresh && cacheRef.current && now - cacheRef.current.timestamp < CACHE_DURATION) {
      setFonts(cacheRef.current.fonts)
      setIsLoading(false)
      return cacheRef.current.fonts
    }

    try {
      setIsLoading(true)
      setError(null)

      // Check if window.api exists (important for build)
      if (!window.api?.fonts?.list) {
        throw new Error('Font API is not available')
      }

      const fontList = await window.api.fonts.list()

      // Update cache
      cacheRef.current = {
        fonts: fontList,
        timestamp: Date.now()
      }

      setFonts(fontList)
      setIsLoading(false)
      return fontList
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load fonts'
      setError(errorMsg)
      setIsLoading(false)
      console.error('Error loading fonts:', err)

      // Return empty array if loading fails
      return []
    }
  }

  const clearCache = () => {
    cacheRef.current = null
    setFonts([])
  }

  const getCachedFonts = () => {
    return cacheRef.current?.fonts || []
  }

  // Load fonts on mount with error handling
  useEffect(() => {
    const initFonts = async () => {
      try {
        // Add a small delay to ensure window.api is available
        await new Promise((resolve) => setTimeout(resolve, 100))
        await loadFonts()
      } catch (err) {
        console.error('Failed to initialize fonts:', err)
        // Don't set error state here to prevent breaking the UI
        // Just log and continue with empty fonts
      }
    }

    initFonts()
  }, [])

  return (
    <FontCacheContext.Provider
      value={{
        fonts,
        isLoading,
        error,
        loadFonts,
        clearCache,
        getCachedFonts
      }}
    >
      {children}
    </FontCacheContext.Provider>
  )
}
