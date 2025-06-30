import { app, BrowserWindow } from "electron";
import { createMainWindow } from "./window-manager";
import {
   setupFileSystemHandlers,
   cleanupFileSystemHandlers,
} from "./fs-handlers";
import { cleanupWindowHandlers } from "./window-handlers";

app.whenReady().then(() => {
   // Configurar handlers del sistema de archivos
   setupFileSystemHandlers();

   // Crear ventana principal
   createMainWindow();

   app.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) {
         createMainWindow();
      }
   });
});

app.on("window-all-closed", function () {
   if (process.platform !== "darwin") app.quit();
});

// Limpiar los handlers cuando la app se cierre
app.on("before-quit", () => {
   cleanupWindowHandlers();
   cleanupFileSystemHandlers();
});
