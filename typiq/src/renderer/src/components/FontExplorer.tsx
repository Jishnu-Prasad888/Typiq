import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import toast from 'react-hot-toast'
import { SearchIcon, FilterIcon, StarIcon } from './Icons'
import FontPreview from './FontPreview'
import { FontInfo, Bookmark } from '../types/preload'

const FontExplorer: React.FC = () => {
  const [fonts, setFonts] = useState<FontInfo[]>([])
  const [filteredFonts, setFilteredFonts] = useState<FontInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [previewSettings, setPreviewSettings] = useState({
    text: 'The quick brown fox jumps over the lazy dog.',
    fontSize: 24,
    fontWeight: 400,
    italic: false,
    underline: false,
    color: '#E6E8EB',
    backgroundColor: 'transparent'
  })

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

  // Load fonts and bookmarks
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [fontList, savedBookmarks, savedSettings] = await Promise.all([
          window.api.fonts.list(),
          window.api.storage.get('bookmarks'),
          window.api.storage.get('settings')
        ])
        setFonts(fontList)
        setFilteredFonts(fontList)
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
        toast.error('Failed to load fonts')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
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
    estimateSize: () => 180,
    overscan: 5
  })

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border-primary border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading system fonts...</p>
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
            <h1 className="text-2xl font-bold text-text-primary">Font Explorer</h1>
            <p className="text-text-secondary">
              {filteredFonts.length} of {fonts.length} fonts
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-64"
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
              className="input min-h-[60px] resize-none"
              placeholder="Enter preview text..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary text-sm">Size:</span>
              <input
                type="number"
                value={previewSettings.fontSize}
                onChange={(e) =>
                  setPreviewSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                }
                className="input w-20"
                min="8"
                max="144"
              />
            </div>

            <select
              value={previewSettings.fontWeight}
              onChange={(e) =>
                setPreviewSettings((prev) => ({ ...prev, fontWeight: parseInt(e.target.value) }))
              }
              className="input w-32"
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

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previewSettings.italic}
                  onChange={(e) =>
                    setPreviewSettings((prev) => ({ ...prev, italic: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-bg-tertiary border-border-primary"
                />
                <span className="text-text-secondary">Italic</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previewSettings.underline}
                  onChange={(e) =>
                    setPreviewSettings((prev) => ({ ...prev, underline: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-bg-tertiary border-border-primary"
                />
                <span className="text-text-secondary">Underline</span>
              </label>
            </div>

            <button onClick={handleSaveSettings} className="btn-primary whitespace-nowrap">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-border-primary bg-bg-secondary flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-4 h-4 text-text-muted" />
          <span className="text-text-secondary">Filter:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-accent-blue text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            All Fonts
          </button>

          <button
            onClick={() => setSelectedCategory('bookmarked')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              selectedCategory === 'bookmarked'
                ? 'bg-accent-gold text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <StarIcon className="w-3 h-3" />
            <span>Bookmarked</span>
          </button>

          {categories
            .filter((cat) => cat !== 'all')
            .map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedCategory === category
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {category}
              </button>
            ))}
        </div>
      </div>

      {/* Font Grid */}
      <div ref={containerRef} className="flex-1 overflow-auto">
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
                key={font.family}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
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
      </div>
    </div>
  )
}

export default FontExplorer
