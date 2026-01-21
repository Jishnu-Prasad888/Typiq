import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Download, Trash2, Save, Info, Moon, Sun } from 'lucide-react'

interface SettingsProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
}

interface AppSettings {
  previewText: string
  fontSize: number
  darkMode: boolean
  comparisonMode: boolean
  autoInjectFonts?: boolean
  defaultCategory?: string
  exportFormat?: 'css' | 'json' | 'csv'
}

const Settings: React.FC<SettingsProps> = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState<AppSettings>({
    previewText: 'The quick brown fox jumps over the lazy dog.',
    fontSize: 24,
    darkMode: darkMode,
    comparisonMode: false,
    autoInjectFonts: true,
    defaultCategory: 'Uncategorized',
    exportFormat: 'css'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode }))
  }, [darkMode])

  const loadSettings = async () => {
    try {
      const saved = await window.api.storage.get('settings')
      if (saved) {
        setSettings((prev) => ({
          ...prev,
          ...saved,
          darkMode: saved.darkMode !== undefined ? saved.darkMode : darkMode
        }))

        if (saved.darkMode !== undefined) {
          setDarkMode(saved.darkMode)
        }
      }
    } catch (error) {
      toast.error('Failed to load settings')
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const settingsToSave: AppSettings = {
        previewText: settings.previewText,
        fontSize: settings.fontSize,
        darkMode: settings.darkMode,
        comparisonMode: settings.comparisonMode,
        autoInjectFonts: settings.autoInjectFonts,
        defaultCategory: settings.defaultCategory,
        exportFormat: settings.exportFormat
      }

      await window.api.storage.set('settings', settingsToSave)
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const exportData = async (format: 'css' | 'json' | 'csv') => {
    setIsExporting(true)
    try {
      const [bookmarks, pairs] = await Promise.all([
        window.api.storage.get('bookmarks'),
        window.api.storage.get('fontPairs')
      ])

      let content = ''
      let filename = ''
      let mimeType = 'text/plain'

      switch (format) {
        case 'css':
          content = bookmarks
            .map((b) => `/* ${b.fontFamily} */\nfont-family: '${b.fontFamily}';\n`)
            .join('\n')
          filename = 'typiq-bookmarks.css'
          mimeType = 'text/css'
          break
        case 'json':
          content = JSON.stringify({ bookmarks, pairs }, null, 2)
          filename = 'typiq-data.json'
          mimeType = 'application/json'
          break
        case 'csv':
          const headers = ['Font Family', 'Category', 'Tags', 'Notes', 'Created']
          const rows = bookmarks.map((b) => [
            b.fontFamily,
            b.category,
            b.tags.join(';'),
            b.notes.replace(/"/g, '""'),
            new Date(b.createdAt).toISOString()
          ])
          content = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
          ].join('\n')
          filename = 'typiq-bookmarks.csv'
          mimeType = 'text/csv'
          break
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Exported as ${filename}`)
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const clearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete all bookmarks and font pairs? This action cannot be undone.'
    )

    if (confirmed) {
      try {
        await Promise.all([
          window.api.storage.set('bookmarks', []),
          window.api.storage.set('fontPairs', [])
        ])
        toast.success('All data cleared successfully')
      } catch (error) {
        toast.error('Failed to clear data')
      }
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode
    setSettings((prev) => ({ ...prev, darkMode: newDarkMode }))
    setDarkMode(newDarkMode)
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bg-primary to-bg-secondary">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl pb-4 font-bold text-text-primary mb-3 bg-gradient-to-r from-accent-orange to-accent-gold bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-text-secondary text-lg">Customize your Typiq experience</p>
        </div>

        <div className="space-y-6">
          {/* Preview Settings */}
          <div className="card p-7 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-blue/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center text-white text-sm font-bold">
                  Aa
                </div>
                Preview Settings
              </h2>
              <p className="text-sm text-text-secondary mt-1">Configure default preview options</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Default Preview Text
                </label>
                <textarea
                  value={settings.previewText}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, previewText: e.target.value }))
                  }
                  placeholder="Enter your default preview text..."
                  className="w-full min-h-[100px] resize-none px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-brown focus:border-accent-brown transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">
                    Default Font Size
                  </label>
                  <div className="p-4 rounded-xl bg-bg-secondary">
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                      }
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-orange"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-accent-brown">12px</span>
                      <div className="px-3 py-1.5 rounded-lg bg-accent-orange text-white font-bold text-sm">
                        {settings.fontSize}px
                      </div>
                      <span className="text-xs text-accent-brown">72px</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-bg-hover transition-all duration-200">
                <div>
                  <div className="font-medium text-text-primary">Auto-inject Fonts</div>
                  <div className="text-sm text-text-secondary">
                    Automatically load fonts for preview
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoInjectFonts}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, autoInjectFonts: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-orange rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-orange"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card p-7 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-green/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                Data Management
              </h2>
              <p className="text-sm text-text-secondary mt-1">Export or clear your data</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Export Your Data
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['json', 'csv'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => exportData(format)}
                      disabled={isExporting}
                      className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        settings.exportFormat === format
                          ? 'bg-bg-tertiary text-text-primary hover:bg-bg-hover border border-border-subtle'
                          : 'bg-bg-tertiary text-text-primary hover:bg-bg-hover border border-border-subtle'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{format.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-3 px-1">
                  Export your bookmarks and font pairs in your preferred format
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-orange to-accent-gold text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
                  </button>

                  <button
                    onClick={clearAllData}
                    className="px-6 py-3 rounded-xl border-2 border-accent-red text-accent-red font-semibold hover:bg-accent-red hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Clear All Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-7 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-transparent hover:border-accent-purple/20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                About Typiq
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-orange via-accent-gold to-accent-red flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-2xl font-bold text-white">T</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xl text-text-primary mb-1">
                    Typiq Font Explorer
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-medium mb-2">
                    Version 1.0.0
                  </div>
                  <p className="text-text-secondary leading-relaxed">
                    A professional font exploration and management tool designed for designers and
                    developers who care about typography.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-bg-primary text-center">
                  <div className="text-2xl font-bold text-accent-orange mb-1">1000+</div>
                  <div className="text-xs text-text-muted">System Fonts</div>
                </div>
                <div className="p-4 rounded-xl bg-bg-primary text-center">
                  <div className="text-2xl font-bold text-accent-blue mb-1">∞</div>
                  <div className="text-xs text-text-muted">Possibilities</div>
                </div>
                <div className="p-4 rounded-xl bg-bg-primary text-center">
                  <div className="text-2xl font-bold text-accent-purple mb-1">100%</div>
                  <div className="text-xs text-text-muted">Free & Open</div>
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle text-center">
                <div className="text-sm text-text-muted">
                  Made with <span className="text-accent-red">♥</span> for typography enthusiasts
                </div>
                <div className="text-xs text-text-muted mt-2">
                  © 2024 Typiq. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
