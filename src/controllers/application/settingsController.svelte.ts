// settingsController.svelte.ts
import { settingsModel } from "@model/application/settingsModel.svelte";
import type { AppSettings } from "@schema/settingsSchema";

class SettingsController {
   // Método genérico para obtener cualquier valor
   get<K extends keyof AppSettings>(key: K): AppSettings[K] {
      return settingsModel.getValue(key);
   }

   // Método genérico para establecer cualquier valor
   set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
      return settingsModel.setValue(key, value);
   }

   // Método genérico para alternar booleanos
   toggle<K extends keyof AppSettings>(key: K): boolean {
      return settingsModel.toggleBoolean(key);
   }

   // Método para obtener todas las configuraciones
   getAllSettings(): AppSettings {
      return settingsModel.getAllSettings();
   }

   // Método para resetear configuraciones
   resetToDefaults(): void {
      settingsModel.resetToDefaults();
   }

   // Método para forzar guardado
   async forceSave(): Promise<void> {
      await settingsModel.forceSave();
   }

   // Método para recargar configuraciones
   async reload(): Promise<void> {
      await settingsModel.reload();
   }

   // Método para exportar configuraciones
   exportSettings(): string {
      return JSON.stringify(settingsModel.data, null, 2);
   }

   // Método para importar configuraciones
   async importSettings(jsonString: string): Promise<boolean> {
      try {
         const settings = JSON.parse(jsonString);
         let hasErrors = false;

         // Validar cada configuración antes de importar
         for (const [key, value] of Object.entries(settings)) {
            const typedKey = key as keyof AppSettings;
            // Optionally, add validation for value type here
            if (!this.set(typedKey, value as AppSettings[typeof typedKey])) {
               hasErrors = true;
               console.warn(`Failed to import setting: ${key}`);
            }
         }

         if (!hasErrors) {
            await this.forceSave();
         }

         return !hasErrors;
      } catch (error) {
         console.error("Error importing settings:", error);
         return false;
      }
   }
}

export const settingsController = $state(new SettingsController());
