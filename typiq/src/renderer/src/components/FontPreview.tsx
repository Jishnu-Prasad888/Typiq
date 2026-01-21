import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { StarIcon } from './Icons'
import { FontInfo } from '../types/preload'

interface FontPreviewProps {
  font: FontInfo
  previewSettings: {
    text: string
    fontSize: number
    fontWeight: number
    italic: boolean
    underline: boolean
    color: string
    backgroundColor: string
  }
  isBookmarked: boolean
  onBookmark: (fontFamily: string) => void
}

const FontPreview: React.FC<FontPreviewProps> = ({
  font,
  previewSettings,
  isBookmarked,
  onBookmark
}) => {
  const [isInjected, setIsInjected] = useState(false)

  useEffect(() => {
    const injectFont = async () => {
      const injected = await window.api.fonts.inject(font.family)
      setIsInjected(injected)
    }
    injectFont()
  }, [font.family])

  const fontStyle = {
    fontFamily: `'${font.family}'`,
    fontSize: `${previewSettings.fontSize}px`,
    fontWeight: previewSettings.fontWeight,
    fontStyle: previewSettings.italic ? 'italic' : 'normal',
    textDecoration: previewSettings.underline ? 'underline' : 'none',
    color: previewSettings.color,
    backgroundColor: previewSettings.backgroundColor
  }

  return (
    <div
      className="card p-6 w-full"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderBottom: '1px solid #D9D9D9'
      }} // thin line
    >
      <div
        className="card p-6 w-full hover:bg-amber-100/20"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <h3 className="text-lg font-semibold text-text-primary" style={{ margin: 0 }}>
            {font.family}
          </h3>
          <button
            onClick={() => onBookmark(font.family)}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked
                ? 'text-accent-gold hover:bg-accent-gold/10'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
            style={{ flexShrink: 0 }}
          >
            <StarIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary">
            {font.styles.length} styles
          </span>
          {font.variable && (
            <span className="text-xs px-2 py-1 rounded bg-accent-blue/10 text-accent-blue">
              Variable
            </span>
          )}
        </div>

        {/* Preview text container that grows */}
        <div style={{ width: '100%', minHeight: 'fit-content' }}>
          <div
            className="rounded-lg bg-bg-tertiary"
            style={{
              ...fontStyle,
              padding: '16px',
              width: '100%',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {isInjected ? previewSettings.text : 'Loading font...'}
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div
          className="flex items-center justify-between w-full flex-wrap gap-2"
          style={{ fontSize: '14px' }}
        >
          {/* Font family info on the left */}
          <div className="text-text-secondary flex items-center gap-2">
            <span style={{ fontWeight: 500 }}>Font Family:</span>
            <code
              className="px-2 py-1 rounded bg-bg-primary text-text-primary font-mono"
              style={{ fontSize: '12px' }}
            >
              {font.family}
            </code>
          </div>

          {/* Buttons on the right */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`font-family: '${font.family}';`)
                toast.success('CSS copied to clipboard!')
              }}
              className="text-xs px-3 py-1 rounded-lg border border-border-subtle bg-bg-secondary text-text-primary hover:bg-bg-hover hover:text-accent-brown transition-colors duration-200 shadow-sm"
            >
              Copy CSS
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(font.family)
                toast.success('Font name copied to clipboard!')
              }}
              className="text-xs px-3 py-1 rounded-lg border border-border-subtle bg-bg-secondary text-text-primary hover:bg-accent-gold hover:text-text-primary transition-colors duration-200 shadow-sm"
            >
              Copy Name
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FontPreview
