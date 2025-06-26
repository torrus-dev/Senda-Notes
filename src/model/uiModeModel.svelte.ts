import { UiModeType } from "@projectTypes/ui/uiTypes";

const STORAGE_KEY = "ui-mode";

interface uiModelSettings {
   uiMode: UiModeType;
}

class UiModeModel {
   settings: uiModelSettings = {
      uiMode: "system",
   };

   constructor() {
      // Cargar favoritos del almacenamiento
      const loadedSettings = this.loadSettings();
      if (loadedSettings) {
         this.settings = loadedSettings;
      }

      // Persistir cambios automáticamente
      $effect.root(() => {
         $effect(() => {
            this.saveSettings(this.settings);
         });
      });
   }
   // Función que guarda favoritos en localStorage
   private saveSettings = (
      settings: uiModelSettings,
      storage: Storage = localStorage,
   ): uiModelSettings => {
      const serialized = JSON.stringify(settings);
      storage.setItem(STORAGE_KEY, serialized);
      return settings;
   };

   // Función que carga favoritos desde localStorage
   private loadSettings = (
      storage: Storage = localStorage,
   ): uiModelSettings | undefined => {
      const serialized = storage.getItem(STORAGE_KEY);
      return serialized ? JSON.parse(serialized) : undefined;
   };
}

export let uiModeModel = $state(new UiModeModel());
