// Use dynamic import for electron-store to handle ESM/CommonJS issues
let ElectronStore: any

const loadElectronStore = async () => {
  if (!ElectronStore) {
    const storeModule = await import('electron-store')
    ElectronStore = storeModule.default
  }
  return ElectronStore
}

// Export types
export interface FontInfo {
  family: string
  styles: string[]
  variable: boolean
}

export interface Bookmark {
  id: string
  fontFamily: string
  category: string
  tags: string[]
  notes: string
  createdAt: number
}

export interface FontPair {
  id: string
  headingFont: string
  bodyFont: string
  name: string
  createdAt: number
}

export interface Settings {
  previewText: string
  fontSize: number
  darkMode: boolean
  comparisonMode: boolean
}

export interface StoreSchema {
  bookmarks: Bookmark[]
  fontPairs: FontPair[]
  settings: Settings
}

// Schema for persistent storage
const schema = {
  bookmarks: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fontFamily: { type: 'string' },
        category: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
        createdAt: { type: 'number' }
      }
    },
    default: []
  },
  fontPairs: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        headingFont: { type: 'string' },
        bodyFont: { type: 'string' },
        name: { type: 'string' },
        createdAt: { type: 'number' }
      }
    },
    default: []
  },
  settings: {
    type: 'object',
    properties: {
      previewText: { type: 'string', default: 'The quick brown fox jumps over the lazy dog.' },
      fontSize: { type: 'number', default: 24 },
      darkMode: { type: 'boolean', default: true },
      comparisonMode: { type: 'boolean', default: false }
    },
    default: {}
  }
} as const

export class TypiqStore {
  private store: any
  private isInitialized = false

  constructor() {
    // Store initialization will happen lazily
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      const StoreClass = await loadElectronStore()
      this.store = new StoreClass({
        schema: schema as any,
        watch: true
      })
      this.isInitialized = true
    }
  }

  async get<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]> {
    await this.ensureInitialized()
    return this.store.get(key)
  }

  async set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): Promise<void> {
    await this.ensureInitialized()
    this.store.set(key, value)
  }

  async delete(key: keyof StoreSchema): Promise<void> {
    await this.ensureInitialized()
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    await this.ensureInitialized()
    this.store.clear()
  }

  // Helper methods
  async getBookmarks(): Promise<Bookmark[]> {
    return this.get('bookmarks')
  }

  async updateBookmark(bookmark: Bookmark): Promise<Bookmark> {
    const bookmarks = await this.getBookmarks()
    const index = bookmarks.findIndex((b) => b.id === bookmark.id)

    if (index >= 0) {
      bookmarks[index] = bookmark
    } else {
      bookmarks.push(bookmark)
    }

    await this.set('bookmarks', bookmarks)
    return bookmark
  }

  async removeBookmark(bookmarkId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks()
    const filtered = bookmarks.filter((b) => b.id !== bookmarkId)
    await this.set('bookmarks', filtered)
    return true
  }
}

// Create and export a singleton instance
export const store = new TypiqStore()
