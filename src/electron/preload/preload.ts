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
      saveUserConfigJson: (filename: string, data: any) =>
         ipcRenderer.invoke("fs:saveUserConfigJson", filename, data),
      loadUserConfigJson: (filename: string) =>
         ipcRenderer.invoke("fs:loadUserConfigJson", filename),
      userConfigExists: (filename: string) =>
         ipcRenderer.invoke("fs:userConfigExists", filename),
   },

   // Información del sistema
   platform: process.platform,
});
