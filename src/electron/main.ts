import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";

const isDev = !app.isPackaged;

// Crear el directorio de configuración si no existe
async function ensureConfigDirectory(): Promise<string> {
   const userDataPath = app.getPath("userData");
   const configDir = path.join(userDataPath, "config");

   try {
      await fs.mkdir(configDir, { recursive: true });
   } catch (error: unknown) {
      if (error instanceof Error) {
         console.error(
            "Error creando directorio de configuración:",
            error.message,
         );
      } else {
         console.error(
            "Error creando directorio de configuración (tipo inesperado):",
            String(error),
         );
      }
   }
   return configDir;
}

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

   // Configurar IPC handlers para sistema de archivos
   ipcMain.handle(
      "fs:saveUserConfigJson",
      async (_, filename: string, data: any) => {
         console.log("guardando settings");
         try {
            const configDir = await ensureConfigDirectory();
            const filePath = path.join(configDir, `${filename}.json`);
            await fs.writeFile(
               filePath,
               JSON.stringify(data, null, 2),
               "utf-8",
            );
            return { success: true };
         } catch (error: unknown) {
            let msg: string;
            if (error instanceof Error) {
               msg = error.message;
            } else {
               msg = String(error);
            }
            console.error(`Error guardando ${filename}.json:`, msg);
            return { success: false, error: msg };
         }
      },
   );

   ipcMain.handle("fs:loadUserConfigJson", async (_, filename: string) => {
      try {
         const configDir = await ensureConfigDirectory();
         const filePath = path.join(configDir, `${filename}.json`);
         const data = await fs.readFile(filePath, "utf-8");
         return { success: true, data: JSON.parse(data) };
      } catch (error: unknown) {
         if (error instanceof Error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
               return { success: false, error: "FILE_NOT_FOUND" };
            }
            console.error(`Error cargando ${filename}.json:`, error.message);
            return { success: false, error: error.message };
         } else {
            console.error(
               `Error cargando ${filename}.json (tipo inesperado):`,
               String(error),
            );
            return { success: false, error: String(error) };
         }
      }
   });

   ipcMain.handle("fs:userConfigExists", async (_, filename: string) => {
      try {
         const configDir = await ensureConfigDirectory();
         const filePath = path.join(configDir, `${filename}.json`);
         await fs.access(filePath);
         return true;
      } catch {
         return false;
      }
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
   // Limpiar handlers de sistema de archivos
   ipcMain.removeAllListeners("fs:saveUserConfigJson");
   ipcMain.removeAllListeners("fs:loadUserConfigJson");
   ipcMain.removeAllListeners("fs:userConfigExists");
});
