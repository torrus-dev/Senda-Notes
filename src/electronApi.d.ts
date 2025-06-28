// types/electronApi.ts
export interface ElectronAPI {
   // Controles de ventana
   minimize: () => Promise<void>;
   maximize: () => Promise<boolean>;
   close: () => Promise<void>;
   isMaximized: () => Promise<boolean>;

   // Sistema de archivos
   fs: {
      saveUserConfigJson: (
         filename: string,
         data: any,
      ) => Promise<{ success: boolean; error?: string }>;
      loadUserConfigJson: (
         filename: string,
      ) => Promise<{ success: boolean; data?: any; error?: string }>;
      userConfigExists: (filename: string) => Promise<boolean>;
   };

   // Información del sistema
   platform: string;
}

declare global {
   interface Window {
      electronAPI: ElectronAPI;
   }
}

export {};
