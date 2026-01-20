// Type definitions for the exposed API

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

export interface API {
  fonts: {
    list: () => Promise<FontInfo[]>
    inject: (fontFamily: string) => Promise<boolean>
  }
  storage: {
    get: <K extends keyof StoreSchema>(key: K) => Promise<StoreSchema[K]>
    set: <K extends keyof StoreSchema>(key: K, value: StoreSchema[K]) => Promise<void>
    updateBookmark: (bookmark: Bookmark) => Promise<Bookmark>
    removeBookmark: (bookmarkId: string) => Promise<boolean>
    addFontPair: (pair: FontPair) => Promise<FontPair>
    removeFontPair: (pairId: string) => Promise<boolean>
  }
}

declare global {
  interface Window {
    api: API
  }
}
