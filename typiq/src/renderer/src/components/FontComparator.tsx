import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { SearchIcon, ShuffleIcon, SaveIcon, ChevronDownIcon } from './Icons'
import { FontInfo, FontPair } from '../types/preload'
import { useFontCache } from '../contexts/FontCacheContext'

interface ComparisonFont {
  id: string
  font: FontInfo | null
  settings: {
    fontSize: number
    fontWeight: number
    italic: boolean
    underline: boolean
  }
}

const FontComparator: React.FC = () => {
  // This now uses the context hook
  const { fonts, isLoading, loadFonts } = useFontCache()
  const [comparisonFonts, setComparisonFonts] = useState<ComparisonFont[]>([
    {
      id: '1',
      font: null,
      settings: { fontSize: 36, fontWeight: 700, italic: false, underline: false }
    },
    {
      id: '2',
      font: null,
      settings: { fontSize: 18, fontWeight: 400, italic: false, underline: false }
    }
  ])
  const [previewText, setPreviewText] = useState('Compare fonts side by side')
  const [savedPairs, setSavedPairs] = useState<FontPair[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isFontListOpen, setIsFontListOpen] = useState(false)
  const [activeFontSlot, setActiveFontSlot] = useState<string | null>(null)
  const fontListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFonts()
    loadSavedPairs()

    const handleClickOutside = (event: MouseEvent) => {
      if (fontListRef.current && !fontListRef.current.contains(event.target as Node)) {
        setIsFontListOpen(false)
        setActiveFontSlot(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [loadFonts])

  const loadSavedPairs = async () => {
    const pairs = await window.api.storage.get('fontPairs')
    setSavedPairs(pairs)
  }

  const updateComparisonFont = (id: string, updates: Partial<ComparisonFont>) => {
    setComparisonFonts((prev) => prev.map((cf) => (cf.id === id ? { ...cf, ...updates } : cf)))
  }

  const addComparisonSlot = () => {
    const newId = Date.now().toString()
    setComparisonFonts((prev) => [
      ...prev,
      {
        id: newId,
        font: fonts[0] || null,
        settings: { fontSize: 16, fontWeight: 400, italic: false, underline: false }
      }
    ])
  }

  const removeComparisonSlot = (id: string) => {
    if (comparisonFonts.length > 2) {
      setComparisonFonts((prev) => prev.filter((cf) => cf.id !== id))
    }
  }

  const savePair = async (headingFont: ComparisonFont, bodyFont: ComparisonFont) => {
    if (!headingFont.font || !bodyFont.font) {
      toast.error('Please select both fonts')
      return
    }

    const pair: FontPair = {
      id: `pair_${Date.now()}`,
      headingFont: headingFont.font.family,
      bodyFont: bodyFont.font.family,
      name: `${headingFont.font.family} + ${bodyFont.font.family}`,
      createdAt: Date.now()
    }

    try {
      const saved = await window.api.storage.addFontPair(pair)
      setSavedPairs((prev) => [...prev, saved])
      toast.success('Font pair saved!')
    } catch (error) {
      toast.error('Failed to save pair')
    }
  }

  const shuffleFonts = () => {
    const shuffled = [...fonts].sort(() => Math.random() - 0.5)
    setComparisonFonts((prev) =>
      prev.map((cf, index) => ({
        ...cf,
        font: shuffled[index] || cf.font
      }))
    )
  }

  const filteredFonts = fonts.filter((font) =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectFontForSlot = (font: FontInfo, slotId?: string) => {
    const targetSlotId = slotId || activeFontSlot
    if (targetSlotId) {
      updateComparisonFont(targetSlotId, { font })
      toast.success(`${font.family} selected`)
    } else {
      const emptySlot = comparisonFonts.find((cf) => !cf.font)
      if (emptySlot) {
        updateComparisonFont(emptySlot.id, { font })
      } else {
        updateComparisonFont(comparisonFonts[0].id, { font })
      }
    }
    setIsFontListOpen(false)
    setActiveFontSlot(null)
  }

  const openFontSelector = (slotId: string) => {
    setActiveFontSlot(slotId)
    setIsFontListOpen(true)
  }

  if (isLoading && fonts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-border-primary animate-spin-slow border-t-accent-blue"></div>
            <div className="absolute inset-0 rounded-full border-4 border-accent-blue animate-spin border-t-accent-white"></div>
          </div>
          <p className="text-text-secondary text-sm">
            Loading fonts<span className="animate-pulse">...</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-bg-primary">
      {/* Left Panel - Font Selection */}
      <div className="w-80 border-r border-border-primary bg-bg-secondary flex flex-col shadow-lg">
        <div className="p-6 border-b border-border-primary bg-gradient-to-b from-bg-secondary to-bg-tertiary">
          <h2 className="text-xl font-bold text-text-primary mb-4">Font Library</h2>
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-bg-primary text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
              onFocus={() => setIsFontListOpen(true)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary px-3 py-1.5 rounded-full bg-bg-tertiary">
              {filteredFonts.length} fonts
            </div>
            {isLoading && <div className="text-xs text-accent-blue animate-pulse">Loading...</div>}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative" ref={fontListRef}>
          {isFontListOpen && (
            <div className="absolute inset-0 bg-bg-secondary z-10 overflow-y-auto">
              <div className="divide-y divide-border-subtle">
                {filteredFonts.map((font) => (
                  <div
                    key={font.family}
                    className="px-4 py-3 hover:bg-bg-hover cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-accent-orange"
                    onClick={() => selectFontForSlot(font)}
                  >
                    <div className="font-medium text-text-primary">{font.family}</div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                      <span>{font.styles.length} styles</span>
                      {font.variable && (
                        <span className="px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">
                          Variable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isFontListOpen && (
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                  <SearchIcon className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-muted text-sm">Click search to browse fonts</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setIsFontListOpen(true)}
                  className="w-full px-4 py-2.5 rounded-xl bg-accent-orange text-white font-semibold shadow-sm hover:bg-accent-gold transition-all duration-200"
                >
                  Browse Fonts
                </button>
                <button
                  onClick={shuffleFonts}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-tertiary text-text-primary font-medium hover:bg-bg-hover transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShuffleIcon className="w-4 h-4" />
                  <span>Shuffle All</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-primary glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Font Comparator</h1>
              <p className="text-text-secondary mt-1">Compare and pair fonts visually</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={shuffleFonts}
                className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary font-medium hover:bg-bg-hover transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <ShuffleIcon className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
              <button
                onClick={addComparisonSlot}
                className="px-5 py-2 rounded-xl bg-accent-orange text-white font-semibold shadow-sm hover:bg-accent-gold transition-all duration-200"
                disabled={comparisonFonts.length >= 4}
              >
                + Add Slot
              </button>
            </div>
          </div>

          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full min-h-[80px] resize-none px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
            placeholder="Enter text to compare..."
          />
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-bg-primary to-bg-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {comparisonFonts.map((cf, index) => (
              <div
                key={cf.id}
                className="card p-5 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-orange/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                      Slot {index + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={cf.settings.fontWeight}
                        onChange={(e) =>
                          updateComparisonFont(cf.id, {
                            settings: { ...cf.settings, fontWeight: parseInt(e.target.value) }
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-border-subtle bg-bg-secondary text-text-primary text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown transition-all duration-200"
                      >
                        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                          <option key={weight} value={weight}>
                            {weight}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={cf.settings.fontSize}
                        onChange={(e) =>
                          updateComparisonFont(cf.id, {
                            settings: { ...cf.settings, fontSize: parseInt(e.target.value) }
                          })
                        }
                        className="w-20 px-3 py-2 rounded-lg border border-border-subtle bg-bg-secondary text-text-primary text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown transition-all duration-200"
                        min="8"
                        max="144"
                      />
                    </div>
                  </div>
                  {comparisonFonts.length > 2 && (
                    <button
                      onClick={() => removeComparisonSlot(cf.id)}
                      className="text-accent-red hover:bg-accent-red/10 p-2 rounded-lg transition-all duration-200 font-bold text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <div
                    className="min-h-[140px] p-4 rounded-xl bg-bg-tertiary shadow-inner overflow-hidden"
                    style={{
                      fontFamily: cf.font ? `'${cf.font.family}'` : 'inherit',
                      fontSize: `${cf.settings.fontSize}px`,
                      fontWeight: cf.settings.fontWeight,
                      fontStyle: cf.settings.italic ? 'italic' : 'normal',
                      textDecoration: cf.settings.underline ? 'underline' : 'none',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.4'
                    }}
                  >
                    {cf.font ? previewText : 'Select a font'}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => openFontSelector(cf.id)}
                    className="w-full text-sm font-medium text-text-primary mb-2 truncate px-4 py-2.5 rounded-xl bg-gradient-to-r from-bg-tertiary to-bg-hover hover:from-bg-hover hover:to-bg-tertiary transition-all duration-200 flex items-center justify-center shadow-sm"
                  >
                    <span className="truncate">{cf.font?.family || 'Select font'}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-2 flex-shrink-0" />
                  </button>
                  <div className="text-xs text-text-secondary">
                    {cf.font?.styles?.length || 0} styles available
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pair Suggestions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">Suggested Pairings</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border-primary to-transparent ml-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisonFonts.slice(0, 2).map((headingFont, index) => {
                const bodyFont = comparisonFonts[index + 1] || comparisonFonts[0]
                if (!headingFont.font || !bodyFont.font) return null

                return (
                  <div
                    key={index}
                    className="card p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-gold/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary text-lg truncate">
                          {headingFont.font.family} + {bodyFont.font.family}
                        </h4>
                        <p className="text-sm text-text-secondary">Heading & Body pair</p>
                      </div>
                      <button
                        onClick={() => savePair(headingFont, bodyFont)}
                        className="flex-shrink-0 ml-3 px-4 py-2 rounded-lg border border-border-subtle bg-bg-tertiary text-text-primary font-medium hover:bg-bg-hover transition-all duration-200 flex items-center space-x-2 shadow-sm"
                      >
                        <SaveIcon className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div
                        className="p-4 rounded-xl bg-gradient-to-br from-bg-tertiary to-bg-hover shadow-sm overflow-hidden"
                        style={{
                          fontFamily: `'${headingFont.font.family}'`,
                          fontSize: '28px',
                          fontWeight: 700,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        Heading Example
                      </div>
                      <div
                        className="p-4 rounded-xl bg-bg-tertiary shadow-sm overflow-hidden"
                        style={{
                          fontFamily: `'${bodyFont.font.family}'`,
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '1.6',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        This is how body text would look when paired with the heading font above.
                        The combination creates visual hierarchy and improves readability.
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Saved Pairs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary">Saved Pairs</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border-primary to-transparent ml-4"></div>
            </div>
            {savedPairs.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-bg-secondary border-2 border-dashed border-border-subtle">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                  <SaveIcon className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-secondary">
                  No saved pairs yet. Save some combinations to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="card p-5 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-accent-blue/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4
                        className="font-semibold text-text-primary truncate flex-1"
                        title={pair.name}
                      >
                        {pair.name}
                      </h4>
                      <button
                        onClick={async () => {
                          await window.api.storage.removeFontPair(pair.id)
                          setSavedPairs((prev) => prev.filter((p) => p.id !== pair.id))
                          toast.success('Pair removed')
                        }}
                        className="text-accent-red hover:bg-accent-red/10 px-2 py-1 rounded text-sm font-medium transition-all duration-200 flex-shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-xs text-text-muted mb-3 px-2 py-1 rounded bg-bg-tertiary inline-block">
                      {new Date(pair.createdAt).toLocaleDateString()}
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="text-sm p-2 rounded-lg bg-bg-tertiary">
                        <span className="text-text-secondary">Heading: </span>
                        <span className="text-text-primary font-medium">{pair.headingFont}</span>
                      </div>
                      <div className="text-sm p-2 rounded-lg bg-bg-tertiary">
                        <span className="text-text-secondary">Body: </span>
                        <span className="text-text-primary font-medium">{pair.bodyFont}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FontComparator
