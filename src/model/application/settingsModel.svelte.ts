// settingsModel.svelte.ts
import { PersistentJsonFileModel } from "@model/persistentJsonFileModel.svelte";
import {
   getDefaultSettings,
   validateSetting,
   type AppSettings,
} from "@schema/settingsSchema";

class SettingsModel extends PersistentJsonFileModel<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }

   // Método para establecer un valor con validación
   setValue<K extends keyof AppSettings>(
      key: K,
      value: AppSettings[K],
   ): boolean {
      if (!validateSetting(key as string, value)) {
         console.warn(`Invalid value for setting ${key as string}:`, value);
         return false;
      }

      this.data[key] = value;
      return true;
   }

   // Método para obtener un valor
   getValue<K extends keyof AppSettings>(key: K): AppSettings[K] {
      return this.data[key];
   }

   // Método para alternar valores booleanos
   toggleBoolean<K extends keyof AppSettings>(key: K): boolean {
      const currentValue = this.data[key];
      if (typeof currentValue === "boolean") {
         this.data[key] = !currentValue as AppSettings[K];
         return true;
      }
      console.warn(`Cannot toggle non-boolean setting: ${key as string}`);
      return false;
   }

   // Método para obtener todas las configuraciones
   getAllSettings(): AppSettings {
      return this.data;
   }
}

export const settingsModel = $state(new SettingsModel());
