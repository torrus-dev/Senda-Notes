export interface ElectronAPI {
   // Controles de ventana
   minimize: () => Promise<void>;
   maximize: () => Promise<boolean>;
   close: () => Promise<void>;
   isMaximized: () => Promise<boolean>;

   fs: {
      writeJson: (
         filename: string,
         data: any,
      ) => { success: boolean; error?: string };
      readJson: (filename: string) => {
         success: boolean;
         data?: any;
         error?: string;
      };
      fileExists: (filename: string) => boolean;
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
