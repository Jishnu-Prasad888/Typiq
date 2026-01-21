import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { store, StoreSchema } from './store.js'
import { join } from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, '../assets/icon.png'),
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0E1116',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'out/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  Menu.setApplicationMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('fonts:list', async () => {
  try {
    const fontListModule = await import('font-list')
    const fonts = await fontListModule.getFonts()

    const parsedFonts = fonts
      .map((font: string) => {
        const cleanName = font.replace(/['"]+/g, '').trim()
        return {
          family: cleanName,
          styles: ['400', '700'],
          variable: false
        }
      })
      .filter(
        (font: { family: string }, index: number, self: Array<{ family: string }>) =>
          index === self.findIndex((f) => f.family === font.family)
      )

    return parsedFonts
  } catch (error) {
    console.error('Failed to list fonts:', error)
    return []
  }
})

ipcMain.handle('fonts:inject', async (_, fontFamily: string) => {
  if (!mainWindow) return false

  try {
    const css = `
      @font-face {
        font-family: '${fontFamily.replace(/'/g, "\\'")}';
        src: local('${fontFamily}');
      }
    `

    await mainWindow.webContents.insertCSS(css)
    return true
  } catch (error) {
    console.error('Failed to inject font:', error)
    return false
  }
})

// Storage IPC handlers - all async now
ipcMain.handle('storage:get', async (_, key: keyof StoreSchema) => {
  return await store.get(key)
})

ipcMain.handle('storage:set', async (_, { key, value }: { key: keyof StoreSchema; value: any }) => {
  await store.set(key, value)
})

ipcMain.handle('storage:updateBookmark', async (_, bookmark: any) => {
  return await store.updateBookmark(bookmark)
})

ipcMain.handle('storage:removeBookmark', async (_, bookmarkId: string) => {
  return await store.removeBookmark(bookmarkId)
})

ipcMain.handle('storage:addFontPair', async (_, pair: any) => {
  const pairs = await store.get('fontPairs')
  pairs.push(pair)
  await store.set('fontPairs', pairs)
  return pair
})

ipcMain.handle('storage:removeFontPair', async (_, pairId: string) => {
  const pairs = await store.get('fontPairs')
  const filtered = pairs.filter((p: any) => p.id !== pairId)
  await store.set('fontPairs', filtered)
  return true
})
