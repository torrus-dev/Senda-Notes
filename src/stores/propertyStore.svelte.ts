import type { Property, GlobalProperty } from "@projectTypes/propertyTypes";
import {
   loadPropertiesFromStorage,
   savePropertiesToStorage,
} from "@utils/storage";
import { settingsStore } from "@stores/settingsStore.svelte";

class PropertyStore {
   // registro de propiedades (nombre, tipo) para saber que propiedades hay creadas globalmente en la aplicación
   private globalProperties = $state<GlobalProperty[]>([]);
   // array con todas las propiedades de todas las notas con id unico
   private noteProperties = $state<Property[]>([]);

   constructor() {
      this.noteProperties = loadPropertiesFromStorage();
      if (settingsStore.debugLevel > 0) {
         console.log(
            "properties cargadas: ",
            $state.snapshot(this.noteProperties),
         );
      }
   }

   saveProperties() {
      savePropertiesToStorage(this.noteProperties);
      if (settingsStore.debugLevel > 0) {
         console.log("guardando notas", $state.snapshot(this.noteProperties));
      }
   }

   getPropertyById(id: Property["id"]): Property | undefined {
      return this.noteProperties.find((properties) => properties.id === id);
   }
   getPropertyByName(propertyName: Property["name"]): Property | undefined {
      return this.noteProperties.find(
         (properties) => properties.name === propertyName,
      );
   }

   createProperty(property: Property): void {
      this.noteProperties = [...this.noteProperties, property];
      this.saveProperties();
   }

   // Actualiza una nota en el array por ID aplicando un updater
   updatePropertyById(
      id: Property["id"],
      updater: (property: Property) => Property,
   ): void {
      const index = this.noteProperties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.noteProperties[index] = updater(this.noteProperties[index]);
      }
      this.saveProperties();
   }

   removeProperty(id: string): void {
      this.noteProperties = this.noteProperties.filter(
         (property) => property.id !== id,
      );
      this.saveProperties();
   }

   // GLOBAL PROPERTIES

   createGlobalProperty(globalProperty: GlobalProperty): void {
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

   getGlobalPropertyById(id: Property["id"]): GlobalProperty | undefined {
      return this.globalProperties.find(
         (globalProperty) => globalProperty.id === id,
      );
   }
   getGlobalPropertyByName(name: Property["name"]): GlobalProperty | undefined {
      return this.globalProperties.find(
         (globalProperty) => globalProperty.name === name,
      );
   }
}

export let propertyStore = $state(new PropertyStore());
