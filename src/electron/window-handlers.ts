import { ipcMain, BrowserWindow } from "electron";

export function setupWindowHandlers(mainWindow: BrowserWindow) {
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
}

export function cleanupWindowHandlers() {
   ipcMain.removeAllListeners("window:minimize");
   ipcMain.removeAllListeners("window:maximize");
   ipcMain.removeAllListeners("window:close");
   ipcMain.removeAllListeners("window:isMaximized");
}
