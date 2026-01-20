import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { SearchIcon, ShuffleIcon, SaveIcon, ChevronDownIcon } from './Icons'
import { FontInfo, FontPair } from '../types/preload'

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
  const [fonts, setFonts] = useState<FontInfo[]>([])
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
  const fontListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFonts()
    loadSavedPairs()

    // Close font list when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (fontListRef.current && !fontListRef.current.contains(event.target as Node)) {
        setIsFontListOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadFonts = async () => {
    try {
      const fontList = await window.api.fonts.list()
      setFonts(fontList)

      // Set default fonts if not already set
      setComparisonFonts((prev) =>
        prev.map((cf, index) => {
          if (!cf.font && fontList[index]) {
            return { ...cf, font: fontList[index] }
          }
          return cf
        })
      )
    } catch (error) {
      toast.error('Failed to load fonts')
    }
  }

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
    if (slotId) {
      updateComparisonFont(slotId, { font })
    } else {
      // Find first empty slot or replace first slot
      const emptySlot = comparisonFonts.find((cf) => !cf.font)
      if (emptySlot) {
        updateComparisonFont(emptySlot.id, { font })
      } else {
        updateComparisonFont(comparisonFonts[0].id, { font })
      }
    }
    setIsFontListOpen(false)
  }

  return (
    <div className="h-full flex">
      {/* Left Panel - Font Selection */}
      <div className="w-80 border-r border-border-primary bg-bg-secondary flex flex-col">
        <div className="p-4 border-b border-border-primary">
          <h2 className="text-lg font-bold text-text-primary mb-3">Font Library</h2>
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-sm"
              onFocus={() => setIsFontListOpen(true)}
            />
          </div>
          <div className="text-sm text-text-secondary">{filteredFonts.length} fonts</div>
        </div>

        <div className="flex-1 overflow-hidden relative" ref={fontListRef}>
          {isFontListOpen && (
            <div className="absolute inset-0 bg-bg-secondary z-10 overflow-y-auto">
              <div className="divide-y divide-border-subtle">
                {filteredFonts.map((font) => (
                  <div
                    key={font.family}
                    className="px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors"
                    onClick={() => selectFontForSlot(font)}
                  >
                    <div className="font-medium text-text-primary">{font.family}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      {font.styles.length} styles • {font.variable ? 'Variable' : 'Static'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isFontListOpen && (
            <div className="p-4 text-center">
              <div className="text-text-muted text-sm">Click search to browse fonts</div>
              <div className="mt-4 space-y-2">
                <button onClick={() => setIsFontListOpen(true)} className="btn-secondary w-full">
                  Browse Fonts
                </button>
                <button
                  onClick={shuffleFonts}
                  className="btn-ghost w-full flex items-center justify-center space-x-2"
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
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Font Comparator</h1>
              <p className="text-text-secondary">Compare and pair fonts visually</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={shuffleFonts} className="btn-secondary flex items-center space-x-2">
                <ShuffleIcon className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
              <button
                onClick={addComparisonSlot}
                className="btn-primary"
                disabled={comparisonFonts.length >= 4}
              >
                + Add Slot
              </button>
            </div>
          </div>

          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="input min-h-[60px] mb-4"
            placeholder="Enter text to compare..."
          />
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comparisonFonts.map((cf, index) => (
              <div key={cf.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-text-secondary mb-2">
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
                        className="input text-sm py-1"
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
                        className="input text-sm w-20 py-1"
                        min="8"
                        max="144"
                      />
                    </div>
                  </div>
                  {comparisonFonts.length > 2 && (
                    <button
                      onClick={() => removeComparisonSlot(cf.id)}
                      className="text-accent-red hover:bg-accent-red/10 p-1 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <div
                    className="min-h-[120px] p-4 rounded-lg bg-bg-tertiary"
                    style={{
                      fontFamily: cf.font ? `'${cf.font.family}'` : 'inherit',
                      fontSize: `${cf.settings.fontSize}px`,
                      fontWeight: cf.settings.fontWeight,
                      fontStyle: cf.settings.italic ? 'italic' : 'normal',
                      textDecoration: cf.settings.underline ? 'underline' : 'none'
                    }}
                  >
                    {cf.font ? previewText : 'Select a font'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsFontListOpen(true)}
                      className="w-full text-sm font-medium text-text-primary mb-1 truncate px-3 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover transition-colors flex items-center justify-center"
                    >
                      {cf.font?.family || 'Select font'}
                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {cf.font?.styles?.length || 0} styles
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pair Suggestions */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">Suggested Pairings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonFonts.slice(0, 2).map((headingFont, index) => {
                const bodyFont = comparisonFonts[index + 1] || comparisonFonts[0]
                if (!headingFont.font || !bodyFont.font) return null

                return (
                  <div key={index} className="card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-text-primary">
                          {headingFont.font.family} + {bodyFont.font.family}
                        </h4>
                        <p className="text-sm text-text-secondary">Heading & Body pair</p>
                      </div>
                      <button
                        onClick={() => savePair(headingFont, bodyFont)}
                        className="btn-ghost flex items-center space-x-2"
                      >
                        <SaveIcon className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div
                        className="p-3 rounded-lg bg-bg-tertiary"
                        style={{
                          fontFamily: `'${headingFont.font.family}'`,
                          fontSize: '24px',
                          fontWeight: 700
                        }}
                      >
                        Heading Example
                      </div>
                      <div
                        className="p-3 rounded-lg bg-bg-tertiary"
                        style={{
                          fontFamily: `'${bodyFont.font.family}'`,
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '1.6'
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
          <div className="mt-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">Saved Pairs</h3>
            {savedPairs.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No saved pairs yet. Save some combinations to see them here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPairs.map((pair) => (
                  <div key={pair.id} className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-text-primary truncate" title={pair.name}>
                        {pair.name}
                      </h4>
                      <button
                        onClick={async () => {
                          await window.api.storage.removeFontPair(pair.id)
                          setSavedPairs((prev) => prev.filter((p) => p.id !== pair.id))
                          toast.success('Pair removed')
                        }}
                        className="text-accent-red hover:bg-accent-red/10 p-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-sm text-text-secondary mb-3">
                      Created: {new Date(pair.createdAt).toLocaleDateString()}
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-text-secondary">Heading: </span>
                        <span className="text-text-primary font-medium">{pair.headingFont}</span>
                      </div>
                      <div className="text-sm">
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
