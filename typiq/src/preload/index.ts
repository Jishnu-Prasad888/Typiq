import { contextBridge, ipcRenderer } from 'electron'

// Define the API implementation
const api = {
  fonts: {
    list: (): Promise<any[]> => ipcRenderer.invoke('fonts:list'),
    inject: (fontFamily: string): Promise<boolean> => ipcRenderer.invoke('fonts:inject', fontFamily)
  },
  storage: {
    get: (key: string): Promise<any> => ipcRenderer.invoke('storage:get', key),
    set: (key: string, value: any): Promise<void> =>
      ipcRenderer.invoke('storage:set', { key, value }),
    updateBookmark: (bookmark: any): Promise<any> =>
      ipcRenderer.invoke('storage:updateBookmark', bookmark),
    removeBookmark: (bookmarkId: string): Promise<boolean> =>
      ipcRenderer.invoke('storage:removeBookmark', bookmarkId),
    addFontPair: (pair: any): Promise<any> => ipcRenderer.invoke('storage:addFontPair', pair),
    removeFontPair: (pairId: string): Promise<boolean> =>
      ipcRenderer.invoke('storage:removeFontPair', pairId)
  }
}

contextBridge.exposeInMainWorld('api', api)
