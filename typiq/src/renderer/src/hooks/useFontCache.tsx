// Create a new file: useFontCache.tsx
import { useState, useEffect, useRef } from 'react'
import { FontInfo } from '../types/preload'

export const useFontCache = () => {
  const [fonts, setFonts] = useState<FontInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      const errorMsg = 'Failed to load fonts'
      setError(errorMsg)
      setIsLoading(false)
      console.error(err)
      return []
    }
  }

  const clearCache = () => {
    cacheRef.current = null
  }

  const getCachedFonts = () => {
    return cacheRef.current?.fonts || []
  }

  // Preload on mount
  useEffect(() => {
    loadFonts()
  }, [])

  return {
    fonts,
    isLoading,
    error,
    loadFonts,
    clearCache,
    getCachedFonts
  }
}
