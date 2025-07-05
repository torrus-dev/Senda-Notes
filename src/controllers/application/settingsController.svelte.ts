import { settingsModel } from "@model/application/settingsModel.svelte";
import { settingsSchema, type AppSettings } from "@schema/settingsSchema";

class SettingsController {
   // Método genérico para obtener cualquier valor
   get<K extends keyof AppSettings>(key: K): AppSettings[K] {
      return settingsModel.data[key];
   }

   // Método genérico para establecer cualquier valor
   set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
      settingsModel.data[key] = value;
   }

   // Método para toggle de valores boolean
   toggle<K extends keyof AppSettings>(key: K): void {
      const setting = settingsSchema[key];

      if (setting.type !== "boolean") {
         throw new Error(`Cannot toggle non-boolean setting: ${String(key)}`);
      }

      (settingsModel.data[key] as any) = !settingsModel.data[key];
   }

   // Método para incrementar valores numéricos
   increment<K extends keyof AppSettings>(key: K, amount: number = 1): void {
      const setting = settingsSchema[key];

      if (setting.type !== "number") {
         throw new Error(`Cannot increment non-number setting: ${String(key)}`);
      }

      const currentValue = settingsModel.data[key] as number;
      const newValue = currentValue + amount;

      // Aplicar límites si están definidos
      if (setting.max !== undefined && newValue > setting.max) {
         (settingsModel.data[key] as any) = setting.max;
      } else if (setting.min !== undefined && newValue < setting.min) {
         (settingsModel.data[key] as any) = setting.min;
      } else {
         (settingsModel.data[key] as any) = newValue;
      }
   }

   // Método para decrementar valores numéricos
   decrement<K extends keyof AppSettings>(key: K, amount: number = 1): void {
      this.increment(key, -amount);
   }

   // Método para resetear un valor específico a su default
   reset<K extends keyof AppSettings>(key: K): void {
      const setting = settingsSchema[key];
      this.set(key, setting.defaultValue);
   }

   // Método para resetear todos los valores
   resetAll(): void {
      settingsModel.resetToDefaults();
   }

   // Método para obtener metadatos de una configuración
   getSettingMeta<K extends keyof AppSettings>(key: K) {
      return settingsSchema[key];
   }

   // Método para validar si un valor es válido para una configuración
   isValidValue<K extends keyof AppSettings>(key: K, value: any): boolean {
      const setting = settingsSchema[key];

      switch (setting.type) {
         case "boolean":
            return typeof value === "boolean";
         case "number":
            if (typeof value !== "number") return false;
            if (setting.min !== undefined && value < setting.min) return false;
            if (setting.max !== undefined && value > setting.max) return false;
            return true;
         case "string":
            return typeof value === "string";
         case "select":
            return setting.options?.includes(value) ?? false;
         default:
            return false;
      }
   }
}

export const settingsController = $state(new SettingsController());
