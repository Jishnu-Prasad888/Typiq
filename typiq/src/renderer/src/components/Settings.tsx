import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface SettingsProps {
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
}

const Settings: React.FC<SettingsProps> = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    previewText: 'The quick brown fox jumps over the lazy dog.',
    fontSize: 24,
    comparisonMode: false,
    autoInjectFonts: true,
    defaultCategory: 'Uncategorized',
    exportFormat: 'css' as 'css' | 'json' | 'csv'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const saved = await window.api.storage.get('settings')
    if (saved) {
      setSettings((prev) => ({ ...prev, ...saved }))
    }
  }

  const saveSettings = async () => {
    await window.api.storage.set('settings', settings)
    toast.success('Settings saved successfully')
  }

  const exportData = async (format: 'css' | 'json' | 'csv') => {
    try {
      const [bookmarks, pairs] = await Promise.all([
        window.api.storage.get('bookmarks'),
        window.api.storage.get('fontPairs')
      ])

      let content = ''
      let filename = ''

      switch (format) {
        case 'css':
          content = bookmarks
            .map((b) => `/* ${b.fontFamily} */\nfont-family: '${b.fontFamily}';\n`)
            .join('\n')
          filename = 'typq-bookmarks.css'
          break
        case 'json':
          content = JSON.stringify({ bookmarks, pairs }, null, 2)
          filename = 'typq-data.json'
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
          filename = 'typq-bookmarks.csv'
          break
      }

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Data exported as ${filename}`)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const clearAllData = async () => {
    if (window.confirm('Are you sure? This will delete all bookmarks and font pairs.')) {
      try {
        await Promise.all([
          window.api.storage.set('bookmarks', []),
          window.api.storage.set('fontPairs', [])
        ])
        toast.success('All data cleared')
      } catch (error) {
        toast.error('Failed to clear data')
      }
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">Customize your Typiq experience</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Dark Mode</div>
                  <div className="text-sm text-text-secondary">Use dark theme</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Preview Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Default Preview Text
                </label>
                <textarea
                  value={settings.previewText}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, previewText: e.target.value }))
                  }
                  className="input min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Default Font Size
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                    }
                    className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-text-secondary mt-1">{settings.fontSize}px</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Default Category
                  </label>
                  <select
                    value={settings.defaultCategory}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, defaultCategory: e.target.value }))
                    }
                    className="input"
                  >
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Favorites">Favorites</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoInjectFonts}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, autoInjectFonts: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-bg-tertiary border-border-primary"
                  />
                  <span className="text-text-primary">Auto-inject fonts for preview</span>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Data Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Export Format
                </label>
                <div className="flex space-x-3">
                  {(['css', 'json', 'csv'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => exportData(format)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        settings.exportFormat === format
                          ? 'bg-accent-blue text-white'
                          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={saveSettings} className="btn-primary">
                  Save Settings
                </button>

                <button
                  onClick={clearAllData}
                  className="btn-secondary border border-accent-red/30 text-accent-red hover:bg-accent-red/10"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">About Typiq</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                  <span className="text-lg font-bold text-white">T</span>
                </div>
                <div>
                  <div className="font-bold text-text-primary">Typiq Font Explorer</div>
                  <div className="text-sm text-text-secondary">Version 1.0.0</div>
                </div>
              </div>

              <p className="text-text-secondary">
                A professional font exploration and management tool for designers and developers.
              </p>

              <div className="pt-4 border-t border-border-subtle">
                <div className="text-sm text-text-muted">© 2024 Typiq. All rights reserved.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
