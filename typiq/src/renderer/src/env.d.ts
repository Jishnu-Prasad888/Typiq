/// <reference types="vite/client" />
/// <reference types="../preload/index.d.ts" />
interface Window {
  api: {
    fonts: {
      list: () => Promise<Array<{ family: string; styles: string[]; variable: boolean }>>
      inject: (fontFamily: string) => Promise<boolean>
    }
    storage: {
      get: <K extends keyof StoreSchema>(key: K) => Promise<StoreSchema[K]>
      set: <K extends keyof StoreSchema>(key: K, value: StoreSchema[K]) => Promise<void>
      updateBookmark: (bookmark: any) => Promise<any>
      removeBookmark: (bookmarkId: string) => Promise<boolean>
      addFontPair: (pair: any) => Promise<any>
      removeFontPair: (pairId: string) => Promise<boolean>
    }
  }
}

interface StoreSchema {
  bookmarks: Array<{
    id: string
    fontFamily: string
    category: string
    tags: string[]
    notes: string
    createdAt: number
  }>
  fontPairs: Array<{
    id: string
    headingFont: string
    bodyFont: string
    name: string
    createdAt: number
  }>
  settings: {
    previewText: string
    fontSize: number
    darkMode: boolean
    comparisonMode: boolean
  }
}
