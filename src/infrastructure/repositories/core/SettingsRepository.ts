import { JsonFileAdapter } from "@infrastructure/persistence/JsonFileAdapter.svelte";
import {
   settingsSchema,
   getDefaultSettings,
   type AppSettings,
   type SettingsKey,
} from "@schema/settingsSchema";

/**
 * Repositorio para la configuración de la aplicación
 */
export class SettingsRepository extends JsonFileAdapter<AppSettings> {
   constructor() {
      super("app-settings");
   }

   protected getDefaultData(): AppSettings {
      return getDefaultSettings();
   }

   /**
    * Obtiene un valor de configuración
    */
   get<K extends SettingsKey>(key: K): AppSettings[K] {
      return this.data[key];
   }

   /**
    * Establece un valor de configuración con validación
    */
   set<K extends SettingsKey>(key: K, value: AppSettings[K]): void {
      if (this.isValidValue(key, value)) {
         this.data[key] = value;
      } else {
         throw new Error(`Invalid value for setting ${String(key)}: ${value}`);
      }
   }

   /**
    * Alterna un valor booleano
    */
   toggle<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];

      if (setting.type !== "boolean") {
         throw new Error(`Cannot toggle non-boolean setting: ${String(key)}`);
      }

      (this.data[key] as any) = !this.data[key];
   }

   /**
    * Incrementa un valor numérico
    */
   increment<K extends SettingsKey>(key: K, amount: number = 1): void {
      const setting = settingsSchema[key];

      if (setting.type !== "number") {
         throw new Error(`Cannot increment non-number setting: ${String(key)}`);
      }

      const currentValue = this.data[key] as number;
      let newValue = currentValue + amount;

      // Aplicar límites
      if (setting.max !== undefined && newValue > setting.max) {
         newValue = setting.max;
      } else if (setting.min !== undefined && newValue < setting.min) {
         newValue = setting.min;
      }

      (this.data[key] as any) = newValue;
   }

   /**
    * Resetea un valor a su default
    */
   reset<K extends SettingsKey>(key: K): void {
      const setting = settingsSchema[key];
      this.data[key] = setting.defaultValue as AppSettings[K];
   }

   /**
    * Resetea todos los valores
    */
   resetAll(): void {
      this.resetToDefaults();
   }

   /**
    * Valida si un valor es válido para una configuración
    */
   private isValidValue<K extends SettingsKey>(key: K, value: any): boolean {
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
