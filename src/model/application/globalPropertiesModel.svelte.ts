import type { GlobalProperty } from "@projectTypes/core/propertyTypes";
import { settingsModel } from "@model/application/settingsModel.svelte";

class GlobalPropertiesModel {
   private static readonly STORAGE_KEY = "GlobalProperties";

   // registro de propiedades (nombre, tipo) para saber que propiedades hay creadas globalmente en la aplicación
   private globalProperties = $state<GlobalProperty[]>([]);

   constructor() {
      this.globalProperties = this.loadFromStorage();
      if (settingsModel.debugLevel > 0) {
         console.log(
            "propiedades globales cargadas: ",
            $state.snapshot(this.globalProperties),
         );
      }
   }

   // MÉTODOS PRIVADOS DE STORAGE
   private loadFromStorage(): GlobalProperty[] {
      try {
         const stored = localStorage.getItem(GlobalPropertiesModel.STORAGE_KEY);
         return stored ? JSON.parse(stored) : [];
      } catch (error) {
         console.error("Error al cargar propiedades globales:", error);
         return [];
      }
   }

   private saveToStorage(): void {
      try {
         localStorage.setItem(
            GlobalPropertiesModel.STORAGE_KEY,
            JSON.stringify(this.globalProperties),
         );
         if (settingsModel.debugLevel > 0) {
            console.log(
               "guardando propiedades globales",
               $state.snapshot(this.globalProperties),
            );
         }
      } catch (error) {
         console.error("Error al guardar propiedades globales:", error);
      }
   }

   // MÉTODOS PÚBLICOS PARA GLOBAL PROPERTIES

   createGlobalProperty(globalProperty: GlobalProperty): void {
      this.globalProperties.push(globalProperty);
      this.saveToStorage();
   }

   deleteGlobalProperty(id: GlobalProperty["id"]): void {
      this.globalProperties = this.globalProperties.filter(
         (globalProperty) => globalProperty.id !== id,
      );
      this.saveToStorage();
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updater: (globalProperty: GlobalProperty) => GlobalProperty,
   ): void {
      const index = this.globalProperties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.globalProperties[index] = updater(this.globalProperties[index]);
      }
      this.saveToStorage();
   }

   getGlobalProperties(): GlobalProperty[] {
      return this.globalProperties;
   }

   getGlobalPropertyById(id: GlobalProperty["id"]): GlobalProperty | undefined {
      return this.globalProperties.find(
         (globalProperty) => globalProperty.id === id,
      );
   }

   getGlobalPropertyByName(
      name: GlobalProperty["name"],
   ): GlobalProperty | undefined {
      return this.globalProperties.find(
         (globalProperty) => globalProperty.name === name,
      );
   }
}

export let globalPropertiesModel = $state(new GlobalPropertiesModel());
