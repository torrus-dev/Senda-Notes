import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

const isDev = !app.isPackaged;

function createWindow() {
   const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 200,
      minHeight: 200,
      frame: false, // Quita la barra de título nativa
      titleBarStyle: "hidden", // Para macOS
      webPreferences: {
         nodeIntegration: false,
         contextIsolation: true,
         webSecurity: false, // Necesario para desarrollo
         preload: path.join(
            process.cwd(),
            "output",
            "electron",
            "preload",
            "preload.js",
         ),
      },
   });

   // Configurar IPC handlers para los controles de ventana
   ipcMain.handle("window:minimize", () => {
      mainWindow.minimize();
   });

   ipcMain.handle("window:maximize", () => {
      if (mainWindow.isMaximized()) {
         mainWindow.unmaximize();
      } else {
         mainWindow.maximize();
      }
      return mainWindow.isMaximized();
   });

   ipcMain.handle("window:close", () => {
      mainWindow.close();
   });

   ipcMain.handle("window:isMaximized", () => {
      return mainWindow.isMaximized();
   });

   if (isDev) {
      // En desarrollo, cargar desde el servidor de Vite
      mainWindow.loadURL("http://localhost:5173").catch(() => {
         console.log("Dev server not ready, retrying...");
         setTimeout(() => mainWindow.loadURL("http://localhost:5173"), 1000);
      });
      // mainWindow.webContents.openDevTools();
   } else {
      // En producción, cargar el archivo estático
      const indexPath = path.join(
         process.cwd(),
         "output",
         "dist",
         "index.html",
      );
      mainWindow.loadFile(indexPath);
   }
}

app.whenReady().then(() => {
   createWindow();

   app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
   });
});

app.on("window-all-closed", function () {
   if (process.platform !== "darwin") app.quit();
});

// Limpiar los handlers cuando la app se cierre
app.on("before-quit", () => {
   ipcMain.removeAllListeners("window:minimize");
   ipcMain.removeAllListeners("window:maximize");
   ipcMain.removeAllListeners("window:close");
   ipcMain.removeAllListeners("window:isMaximized");
});
