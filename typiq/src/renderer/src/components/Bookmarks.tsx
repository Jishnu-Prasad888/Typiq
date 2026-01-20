import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { SearchIcon, TagIcon, EditIcon, TrashIcon } from './Icons'

interface Bookmark {
  id: string
  fontFamily: string
  category: string
  tags: string[]
  notes: string
  createdAt: number
}

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadBookmarks()
  }, [])

  useEffect(() => {
    let result = bookmarks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.fontFamily.toLowerCase().includes(query) ||
          b.notes.toLowerCase().includes(query) ||
          b.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter((b) => b.category === selectedCategory)
    }

    setFilteredBookmarks(result)
  }, [bookmarks, searchQuery, selectedCategory])

  const loadBookmarks = async () => {
    const saved = await window.api.storage.get('bookmarks')
    setBookmarks(saved)
    setFilteredBookmarks(saved)
  }

  const categories = Array.from(new Set(['all', ...bookmarks.map((b) => b.category)]))

  const handleDeleteBookmark = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this bookmark?')) {
      await window.api.storage.removeBookmark(id)
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
      toast.success('Bookmark removed')
    }
  }

  const handleSaveEdit = async (updatedBookmark: Bookmark) => {
    try {
      await window.api.storage.updateBookmark(updatedBookmark)
      setBookmarks((prev) => prev.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b)))
      setShowEditModal(false)
      setEditingBookmark(null)
      toast.success('Bookmark updated')
    } catch (error) {
      toast.error('Failed to update bookmark')
    }
  }

  const EditModal: React.FC = () => {
    const [formData, setFormData] = useState<Bookmark>(editingBookmark!)

    if (!editingBookmark) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-bg-secondary rounded-xl shadow-card max-w-md w-full">
          <div className="p-6 border-b border-border-primary">
            <h3 className="text-lg font-bold text-text-primary">Edit Bookmark</h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Font Family
              </label>
              <div className="input opacity-75 cursor-not-allowed">{formData.fontFamily}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="Uncategorized">Uncategorized</option>
                <option value="Favorites">Favorites</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Web">Web</option>
                <option value="Print">Print</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  }))
                }
                className="input"
                placeholder="web, sans-serif, modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="input min-h-[100px] resize-none"
                placeholder="Add notes about this font..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-border-primary flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditModal(false)
                setEditingBookmark(null)
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={() => handleSaveEdit(formData)} className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {showEditModal && <EditModal />}

      {/* Header */}
      <div className="p-6 border-b border-border-primary glass-panel">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Bookmarks</h1>
            <p className="text-text-secondary">{filteredBookmarks.length} bookmarked fonts</p>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TagIcon className="w-4 h-4 text-text-muted" />
            <span className="text-text-secondary">Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category: string) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-accent-teal text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
              <TagIcon className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No bookmarks yet</h3>
            <p className="text-text-secondary max-w-md">
              Bookmark fonts you like while exploring to save them here for quick access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="card p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-lg font-bold text-text-primary truncate mb-1"
                      title={bookmark.fontFamily}
                    >
                      {bookmark.fontFamily}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded bg-accent-teal/10 text-accent-teal">
                        {bookmark.category}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingBookmark(bookmark)
                        setShowEditModal(true)
                      }}
                      className="p-1.5 rounded hover:bg-bg-hover text-text-secondary hover:text-text-primary"
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="p-1.5 rounded hover:bg-accent-red/10 text-text-secondary hover:text-accent-red"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Font Preview */}
                <div className="mb-4">
                  <div
                    className="min-h-[60px] p-3 rounded-lg bg-bg-tertiary"
                    style={{
                      fontFamily: `'${bookmark.fontFamily}'`,
                      fontSize: '20px'
                    }}
                  >
                    The quick brown fox jumps
                  </div>
                </div>

                {/* Tags */}
                {bookmark.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {bookmark.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-bg-tertiary text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {bookmark.notes && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <p className="text-sm text-text-secondary line-clamp-2">{bookmark.notes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`font-family: '${bookmark.fontFamily}';`)
                      toast.success('CSS copied to clipboard')
                    }}
                    className="text-sm btn-ghost px-3 py-1"
                  >
                    Copy CSS
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to explorer with this font selected
                      // Implementation depends on routing setup
                    }}
                    className="text-sm btn-secondary px-3 py-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookmarks
