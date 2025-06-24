const { contextBridge, ipcRenderer } = require("electron");

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld("electronAPI", {
   // Controles de ventana
   minimize: () => ipcRenderer.invoke("window:minimize"),
   maximize: () => ipcRenderer.invoke("window:maximize"),
   close: () => ipcRenderer.invoke("window:close"),
   isMaximized: () => ipcRenderer.invoke("window:isMaximized"),

   // Información del sistema
   platform: process.platform,
});
