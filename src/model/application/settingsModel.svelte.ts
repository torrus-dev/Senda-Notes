import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";
import { getDefaultSettings, type AppSettings } from "@schema/settingsSchema";

class SettingsModel extends PersistentJsonFileModel<AppSettings> {
   constructor() {
      super("app-settings", false); // false = no auto-inicializar
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }

   // Método público para inicializar manualmente
   async initialize(): Promise<void> {
      await this.initializeData();
   }
}

export const settingsModel = $state(new SettingsModel());