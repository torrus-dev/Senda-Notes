import {
   settingsSchema,
   type AppSettings,
   type SettingsKey,
} from "@schema/settingsSchema";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { SettingsModel } from "@model/application/settingsModel.svelte";

class SettingsController {
   private get settingsModel(): SettingsModel {
      return startupManager.getModel("settingsModel");
   }

   get isReady(): boolean {
      return this.settingsModel.isInitialized;
   }
   // Método genérico para obtener cualquier valor
   get<K extends SettingsKey>(key: K): AppSettings[K] {
      return this.settingsModel.data[key];
   }

   // Método genérico para establecer cualquier valor
   set<K extends SettingsKey>(key: K, value: AppSettings[K]): void {
      this.settingsModel.data[key] = value;
   }

   // Método para toggle de valores boolean
   toggle<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];

      if (setting.type !== "boolean") {
         throw new Error(`Cannot toggle non-boolean setting: ${String(key)}`);
      }

      (this.settingsModel.data[key] as any) = !this.settingsModel.data[key];
   }

   // Método para incrementar valores numéricos
   increment<K extends SettingsKey>(key: K, amount: number = 1): void {
      const setting = settingsSchema[key];

      if (setting.type !== "number") {
         throw new Error(`Cannot increment non-number setting: ${String(key)}`);
      }

      const currentValue = this.settingsModel.data[key] as number;
      const newValue = currentValue + amount;

      // Aplicar límites si están definidos
      if (setting.max !== undefined && newValue > setting.max) {
         (this.settingsModel.data[key] as any) = setting.max;
      } else if (setting.min !== undefined && newValue < setting.min) {
         (this.settingsModel.data[key] as any) = setting.min;
      } else {
         (this.settingsModel.data[key] as any) = newValue;
      }
   }

   // Método para decrementar valores numéricos
   decrement<K extends SettingsKey>(key: K, amount: number = 1): void {
      this.increment(key, -amount);
   }

   // Método para resetear un valor específico a su default
   reset<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];
      this.set(key, setting.defaultValue as AppSettings[K]);
   }

   // Método para resetear todos los valores
   resetAll(): void {
      this.settingsModel.resetToDefaults();
   }

   // Método para obtener metadatos de una configuración
   getSettingMeta<K extends SettingsKey>(key: K) {
      return settingsSchema[key];
   }

   // Método para validar si un valor es válido para una configuración
   isValidValue<K extends SettingsKey>(key: K, value: any): boolean {
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

let instance: SettingsController | null = null;

export const settingsController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new SettingsController();
         const value = instance[prop as keyof SettingsController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as SettingsController;
