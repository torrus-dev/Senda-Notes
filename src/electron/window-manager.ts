import { BrowserWindow, app } from "electron";
import path from "path";
import { setupWindowHandlers } from "./window-handlers";

const isDev = !app.isPackaged;

export function createMainWindow(): BrowserWindow {
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

   // para facilitar el desarrollo
   if (isDev) {
      mainWindow.maximize(); // Maximiza la ventana
      mainWindow.webContents.openDevTools();
   }

   // Configurar los handlers de ventana
   setupWindowHandlers(mainWindow);

   // Cargar la aplicación
   loadApplication(mainWindow);

   return mainWindow;
}

function loadApplication(mainWindow: BrowserWindow) {
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
