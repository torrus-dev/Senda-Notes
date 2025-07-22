import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import type { SettingsRepository } from "@infrastructure/repositories/core/SettingsRepository";
import {
   settingsSchema,
   type AppSettings,
   type SettingsKey,
} from "@schema/settingsSchema";

class SettingsController {
   private get settingsRepository(): SettingsRepository {
      return startupManager.getService("settingsRepository");
   }

   get isReady(): boolean {
      return this.settingsRepository.isInitialized;
   }

   // Método genérico para obtener cualquier valor
   get<K extends SettingsKey>(key: K): AppSettings[K] {
      return this.settingsRepository.get(key);
   }

   // Método genérico para establecer cualquier valor
   set<K extends SettingsKey>(key: K, value: AppSettings[K]): void {
      this.settingsRepository.set(key, value);
   }

   // Método para toggle de valores boolean
   toggle<K extends SettingsKey>(key: K): void {
      this.settingsRepository.toggle(key);
   }

   // Método para incrementar valores numéricos
   increment<K extends SettingsKey>(key: K, amount: number = 1): void {
      this.settingsRepository.increment(key, amount);
   }

   // Método para decrementar valores numéricos
   decrement<K extends SettingsKey>(key: K, amount: number = 1): void {
      this.settingsRepository.increment(key, -amount);
   }

   // Método para resetear un valor específico a su default
   reset<K extends SettingsKey>(key: K): void {
      this.settingsRepository.reset(key);
   }

   // Método para resetear todos los valores
   resetAll(): void {
      this.settingsRepository.resetAll();
   }

   // Método para obtener metadatos de una configuración
   getSettingMeta<K extends SettingsKey>(key: K) {
      return settingsSchema[key];
   }
}

// Mantener el patrón Proxy si lo necesitas
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
