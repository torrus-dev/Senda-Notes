import { ipcMain, app } from "electron";
import path from "path";
import fs from "fs/promises";

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

export function setupFileSystemHandlers() {
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
}

export function cleanupFileSystemHandlers() {
   ipcMain.removeAllListeners("fs:saveUserConfigJson");
   ipcMain.removeAllListeners("fs:loadUserConfigJson");
   ipcMain.removeAllListeners("fs:userConfigExists");
}
