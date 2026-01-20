// Shared types for renderer components
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
