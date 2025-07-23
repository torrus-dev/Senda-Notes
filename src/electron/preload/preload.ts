import { contextBridge, ipcRenderer } from "electron";

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld("electronAPI", {
   // Controles de ventana
   minimize: () => ipcRenderer.invoke("window:minimize"),
   maximize: () => ipcRenderer.invoke("window:maximize"),
   close: () => ipcRenderer.invoke("window:close"),
   isMaximized: () => ipcRenderer.invoke("window:isMaximized"),

   // Sistema de archivos para configuración
   fs: {
      writeJson: (filename: string, data: any) =>
         ipcRenderer.sendSync("fs:writeJson", filename, data),
      readJson: (filename: string) =>
         ipcRenderer.sendSync("fs:readJson", filename),
      fileExists: (filename: string) =>
         ipcRenderer.sendSync("fs:fileExists", filename),
   },

   // Información del sistema
   platform: process.platform,
});
