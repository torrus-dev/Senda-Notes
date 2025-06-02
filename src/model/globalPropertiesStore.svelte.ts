import type { GlobalProperty } from "@projectTypes/propertyTypes";
import {
   loadGlobalPropertiesFromStorage,
   saveGlobalPropertiesToStorage,
} from "@utils/storage";
import { settingsStore } from "@model/settingsStore.svelte";

class GlobalPropertiesStore {
   // registro de propiedades (nombre, tipo) para saber que propiedades hay creadas globalmente en la aplicación
   private globalProperties = $state<GlobalProperty[]>([]);

   constructor() {
      this.globalProperties = loadGlobalPropertiesFromStorage() || [];
      if (settingsStore.debugLevel > 0) {
         console.log(
            "propiedades globales cargadas: ",
            $state.snapshot(this.globalProperties),
         );
      }
   }

   saveGlobalProperties() {
      saveGlobalPropertiesToStorage(this.globalProperties);
      if (settingsStore.debugLevel > 0) {
         console.log(
            "guardando propiedades globales",
            $state.snapshot(this.globalProperties),
         );
      }
   }

   // GLOBAL PROPERTIES

   createGlobalProperty(globalProperty: GlobalProperty): void {
      this.globalProperties.push(globalProperty);
      this.saveGlobalProperties();
   }

   deleteGlobalProperty(id: GlobalProperty["id"]) {
      this.globalProperties = this.globalProperties.filter(
         (globalProperty) => globalProperty.id !== id,
      );
      this.saveGlobalProperties();
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updater: (globalProperty: GlobalProperty) => GlobalProperty,
   ) {
      const index = this.globalProperties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.globalProperties[index] = updater(this.globalProperties[index]);
      }
      this.saveGlobalProperties();
   }

   getGlobalProperties() {
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

export let globalPropertiesStore = $state(new GlobalPropertiesStore());
