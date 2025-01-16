import { app, BrowserWindow } from 'electron'
import path from 'path'

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(process.cwd(), 'output', 'electron', 'preload', 'preload.js')
    }
  })

  // Obtener la ruta base de la aplicación
  const indexPath = path.join(process.cwd(), 'output', 'dist', 'index.html')
  mainWindow.loadFile(indexPath)
  
  // Abrir DevTools
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})