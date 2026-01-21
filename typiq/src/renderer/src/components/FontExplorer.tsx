import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import toast from 'react-hot-toast'
import { SearchIcon, FilterIcon, StarIcon, RefreshCwIcon } from './Icons'
import FontPreview from './FontPreview'
import { FontInfo, Bookmark } from '../types/preload'
import { useFontCache } from '../contexts/FontCacheContext' // Add this import
import { Search } from 'lucide-react'
const FontExplorer: React.FC = () => {
  const { fonts, isLoading, error, loadFonts, getCachedFonts } = useFontCache()

  const [filteredFonts, setFilteredFonts] = useState<FontInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [previewSettings, setPreviewSettings] = useState({
    text: 'The quick brown fox jumps over the lazy dog.',
    fontSize: 24,
    fontWeight: 400,
    italic: false,
    underline: false,
    color: '#2A231C',
    backgroundColor: 'transparent'
  })
  const [refreshCount, setRefreshCount] = useState(0)

  // Categories from font names (auto-detected)
  const categories = useMemo(() => {
    const cats = new Set<string>(['all'])
    fonts.forEach((font) => {
      const family = font.family.toLowerCase()
      if (family.includes('mono') || family.includes('code')) cats.add('monospace')
      if (family.includes('sans')) cats.add('sans-serif')
      if (family.includes('serif')) cats.add('serif')
      if (family.includes('display')) cats.add('display')
      if (family.includes('handwriting') || family.includes('script')) cats.add('handwriting')
    })
    return Array.from(cats)
  }, [fonts])

  // Load bookmarks and settings
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [savedBookmarks, savedSettings] = await Promise.all([
          window.api.storage.get('bookmarks'),
          window.api.storage.get('settings')
        ])
        setBookmarks(savedBookmarks)

        // Load saved settings
        if (savedSettings?.previewText) {
          setPreviewSettings((prev) => ({
            ...prev,
            text: savedSettings.previewText,
            fontSize: savedSettings.fontSize || prev.fontSize
          }))
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }
    loadUserData()
  }, [])

  // Filter fonts based on search and category
  useEffect(() => {
    let result = fonts

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((font) => font.family.toLowerCase().includes(query))
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter((font) => {
        const family = font.family.toLowerCase()
        switch (selectedCategory) {
          case 'monospace':
            return family.includes('mono') || family.includes('code')
          case 'sans-serif':
            return family.includes('sans') && !family.includes('mono')
          case 'serif':
            return family.includes('serif')
          case 'display':
            return family.includes('display')
          case 'handwriting':
            return family.includes('handwriting') || family.includes('script')
          default:
            return true
        }
      })
    }

    // Apply bookmarked filter
    if (selectedCategory === 'bookmarked') {
      const bookmarkedFonts = bookmarks.map((b) => b.fontFamily)
      result = result.filter((font) => bookmarkedFonts.includes(font.family))
    }

    setFilteredFonts(result)
  }, [fonts, searchQuery, selectedCategory, bookmarks])

  // Virtual list setup
  const containerRef = React.useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredFonts.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => Math.max(200, previewSettings.fontSize * 8),
    overscan: 3
  })

  // Remeasure when preview settings change
  useEffect(() => {
    rowVirtualizer.measure()
  }, [previewSettings.fontSize, previewSettings.text, rowVirtualizer])

  const handleBookmark = useCallback(
    async (fontFamily: string) => {
      const existingBookmark = bookmarks.find((b) => b.fontFamily === fontFamily)

      if (existingBookmark) {
        await window.api.storage.removeBookmark(existingBookmark.id)
        setBookmarks((prev) => prev.filter((b) => b.id !== existingBookmark.id))
        toast.success('Removed from bookmarks')
      } else {
        const newBookmark: Bookmark = {
          id: `bookmark_${Date.now()}`,
          fontFamily,
          category: 'Uncategorized',
          tags: [],
          notes: '',
          createdAt: Date.now()
        }
        const saved = await window.api.storage.updateBookmark(newBookmark)
        setBookmarks((prev) => [...prev, saved])
        toast.success('Added to bookmarks')
      }
    },
    [bookmarks]
  )

  const handleSaveSettings = async () => {
    try {
      // Get current settings and update with preview text
      const currentSettings = await window.api.storage.get('settings')
      const updatedSettings = {
        ...currentSettings,
        previewText: previewSettings.text,
        fontSize: previewSettings.fontSize,
        darkMode: currentSettings?.darkMode ?? true,
        comparisonMode: currentSettings?.comparisonMode ?? false
      }

      await window.api.storage.set('settings', updatedSettings)
      toast.success('Settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const handleRefreshFonts = async () => {
    setRefreshCount((prev) => prev + 1)
    await loadFonts(true) // Force refresh
    toast.success('Fonts refreshed')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl text-accent-red">!</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Failed to load fonts</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <button onClick={() => loadFonts(true)} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isLoading && fonts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-6 mx-auto">
            <span className="text-3xl text-text-muted">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-3">No Fonts Available</h2>
          <p className="text-text-secondary mb-6">
            Unable to load system fonts. This may be due to permission issues or system constraints.
          </p>
          <button
            onClick={() => loadFonts(true)}
            className="px-6 py-3 rounded-full bg-accent-orange text-white font-semibold hover:bg-accent-gold transition-all duration-200"
          >
            Retry Loading Fonts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-primary glass-panel">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-betsy text-5xl text-text-primary">Typiq</h1>
            <div className="flex items-center space-x-4 mt-1">
              <p
                className=" text-text-secondary text-sm leading-relaxed tracking-wide 
              bg-bg-secondary px-3 py-1 rounded-full hover:bg-bg-hover hover:text-accent-brown my-1 inline-block"
              >
                {filteredFonts.length} of {fonts.length} fonts
              </p>

              <div className="text-xs px-2 py-1 rounded-full bg-bg-tertiary text-text-muted">
                Cache: {getCachedFonts().length > 0 ? 'Ready' : 'Empty'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshFonts}
              className="btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCwIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-border-subtle bg-bg-primary text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Preview Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-0">
            <textarea
              value={previewSettings.text}
              onChange={(e) => setPreviewSettings((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Enter preview text..."
              className="w-full min-h-15 resize-none px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary text-sm text-shadow-blue-50">Size:</span>
              <input
                type="number"
                value={previewSettings.fontSize}
                onChange={(e) =>
                  setPreviewSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                }
                min="8"
                max="144"
                className="w-20 px-3 py-2 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
              />
            </div>

            <select
              value={previewSettings.fontWeight}
              onChange={(e) =>
                setPreviewSettings((prev) => ({ ...prev, fontWeight: parseInt(e.target.value) }))
              }
              className="w-32 px-4 py-2 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
            >
              <option value="100">Thin (100)</option>
              <option value="200">Extra Light (200)</option>
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previewSettings.italic}
                  onChange={(e) =>
                    setPreviewSettings((prev) => ({ ...prev, italic: e.target.checked }))
                  }
                  className="w-5 h-5 rounded-lg border border-border-subtle bg-bg-tertiary checked:bg-accent-orange checked:border-accent-orange transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
                <span className="text-text-secondary select-none">Italic</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previewSettings.underline}
                  onChange={(e) =>
                    setPreviewSettings((prev) => ({ ...prev, underline: e.target.checked }))
                  }
                  className="w-5 h-5 rounded-lg border border-border-subtle bg-bg-tertiary checked:bg-accent-orange checked:border-accent-orange transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-orange"
                />
                <span className="text-text-secondary select-none">Underline</span>
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-full bg-accent-orange text-accent-white font-semibold shadow-sm hover:bg-accent-gold hover:text-text-primary active:bg-accent-red transition-all duration-200 whitespace-nowrap"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-border-primary bg-bg-secondary flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FilterIcon className="w-4 h-4 text-text-muted" />
            <span className="text-text-secondary">Filter:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-accent-orange text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              All Fonts
            </button>

            <button
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedCategory === 'bookmarked'
                  ? 'bg-accent-orange text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <StarIcon className="w-3 h-3" />
              <span>Bookmarked ({bookmarks.length})</span>
            </button>

            {categories
              .filter((cat) => cat !== 'all')
              .map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    selectedCategory === category
                      ? 'bg-accent-orange text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  {category}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Font Grid */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {filteredFonts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
              <SearchIcon className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No fonts found</h3>
            <p className="text-text-secondary max-w-md">
              Try changing your search query or category filter.
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative'
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const font = filteredFonts[virtualRow.index]
              const isBookmarked = bookmarks.some((b) => b.fontFamily === font.family)

              return (
                <div
                  key={`${font.family}-${refreshCount}`}
                  ref={rowVirtualizer.measureElement} // <-- attach measurement here
                  data-index={virtualRow.index} // <-- ADD THIS LINE
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <FontPreview
                    font={font}
                    previewSettings={previewSettings}
                    isBookmarked={isBookmarked}
                    onBookmark={handleBookmark}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FontExplorer
