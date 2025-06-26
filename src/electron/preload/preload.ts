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
      saveJson: (filename: string, data: any) =>
         ipcRenderer.invoke("fs:saveJson", filename, data),
      loadJson: (filename: string) =>
         ipcRenderer.invoke("fs:loadJson", filename),
      exists: (filename: string) => ipcRenderer.invoke("fs:exists", filename),
   },

   // Información del sistema
   platform: process.platform,
});
