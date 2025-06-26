export interface ElectronAPI {
   minimize: () => Promise<void>;
   maximize: () => Promise<boolean>;
   close: () => Promise<void>;
   isMaximized: () => Promise<boolean>;
   platform: string;
}

declare global {
   interface Window {
      electronAPI: ElectronAPI;
   }
}
