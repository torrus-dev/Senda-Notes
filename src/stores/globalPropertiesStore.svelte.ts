import type { GlobalProperty } from "@projectTypes/propertyTypes";
import {
   loadGlobalPropertiesFromStorage,
   saveGlobalPropertiesToStorage,
} from "@utils/storage";
import { settingsStore } from "@stores/settingsStore.svelte";

class GlobalPropertyStore {
   // registro de propiedades (nombre, tipo) para saber que propiedades hay creadas globalmente en la aplicación
   private globalProperties = $state<GlobalProperty[]>([]);

   constructor() {
      this.globalProperties = loadGlobalPropertiesFromStorage();
      if (settingsStore.debugLevel > 0) {
         console.log(
            "properties globales cargadas: ",
            $state.snapshot(this.globalProperties),
         );
      }
   }

   saveProperties() {
      saveGlobalPropertiesToStorage(this.globalProperties);
      if (settingsStore.debugLevel > 0) {
         console.log(
            "guardando propiedades globales",
            $state.snapshot(this.globalProperties),
         );
      }
   }

   createGlobalProperty(globalProperty: GlobalProperty): void {
      if (settingsStore.debugLevel > 0) {
         console.log("added new global property", globalProperty);
      }
      this.globalProperties.push(globalProperty);
   }

   deleteGlobalProperty(id: GlobalProperty["id"]) {
      this.globalProperties = this.globalProperties.filter(
         (globalProperty) => globalProperty.id !== id,
      );
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updater: (globalProperty: GlobalProperty) => GlobalProperty,
   ) {
      const index = this.globalProperties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.globalProperties[index] = updater(this.globalProperties[index]);
      }
      this.saveProperties();
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

export let globalPropertiesStore = $state(new GlobalPropertyStore());
