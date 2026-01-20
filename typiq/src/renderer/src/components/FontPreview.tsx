import React, { useState, useEffect } from 'react'
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
    <div className="p-4 hover:bg-bg-hover/50 transition-colors">
      <div className="card p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate" title={font.family}>
              {font.family}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary">
                {font.styles.length} styles
              </span>
              {font.variable && (
                <span className="text-xs px-2 py-1 rounded bg-accent-blue/10 text-accent-blue">
                  Variable
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBookmark(font.family)}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked
                ? 'text-accent-gold hover:bg-accent-gold/10'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <StarIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="mb-4">
          <div
            className="min-h-[80px] p-3 rounded-lg bg-bg-tertiary overflow-hidden"
            style={fontStyle}
          >
            {isInjected ? previewSettings.text : 'Loading font...'}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-text-secondary">
            <span className="font-medium">Font Family:</span>{' '}
            <code className="px-2 py-1 rounded bg-bg-primary text-text-primary font-mono">
              {font.family}
            </code>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`font-family: '${font.family}';`)
                // Show toast would be handled by parent
              }}
              className="text-xs btn-ghost px-3 py-1"
            >
              Copy CSS
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(font.family)
              }}
              className="text-xs btn-secondary px-3 py-1"
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
