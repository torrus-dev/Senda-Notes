import { ipcMain, app } from "electron";
import path from "path";
import fs from "fs";

// Crear el directorio de configuración si no existe (síncrono)
function ensureConfigDirectory(): string {
   const userDataPath = app.getPath("userData");
   const configDir = path.join(userDataPath, "config");

   try {
      fs.mkdirSync(configDir, { recursive: true });
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

export function setupFileSystemHandlers() {
   // Configurar IPC handlers síncronos para sistema de archivos

   ipcMain.on("fs:writeJson", (event, filename: string, data: any) => {
      console.log("Guardando JSON:", filename);
      try {
         const configDir = ensureConfigDirectory();
         const filePath = path.join(configDir, `${filename}.json`);
         fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
         event.returnValue = { success: true };
      } catch (error: unknown) {
         let msg: string;
         if (error instanceof Error) {
            msg = error.message;
         } else {
            msg = String(error);
         }
         console.error(`Error guardando ${filename}.json:`, msg);
         event.returnValue = { success: false, error: msg };
      }
   });

   ipcMain.on("fs:readJson", (event, filename: string) => {
      try {
         const configDir = ensureConfigDirectory();
         const filePath = path.join(configDir, `${filename}.json`);
         const data = fs.readFileSync(filePath, "utf-8");
         event.returnValue = { success: true, data: JSON.parse(data) };
      } catch (error: unknown) {
         if (error instanceof Error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
               event.returnValue = { success: false, error: "FILE_NOT_FOUND" };
               return;
            }
            console.error(`Error cargando ${filename}.json:`, error.message);
            event.returnValue = { success: false, error: error.message };
         } else {
            console.error(
               `Error cargando ${filename}.json (tipo inesperado):`,
               String(error),
            );
            event.returnValue = { success: false, error: String(error) };
         }
      }
   });

   ipcMain.on("fs:fileExists", (event, filename: string) => {
      try {
         const configDir = ensureConfigDirectory();
         const filePath = path.join(configDir, `${filename}.json`);
         fs.accessSync(filePath);
         event.returnValue = true;
      } catch {
         event.returnValue = false;
      }
   });
}

export function cleanupFileSystemHandlers() {
   ipcMain.removeAllListeners("fs:writeJson");
   ipcMain.removeAllListeners("fs:readJson");
   ipcMain.removeAllListeners("fs:fileExists");
}
