import type { Property } from "@projectTypes/propertyTypes";
import {
   loadPropertiesFromStorage,
   savePropertiesToStorage,
} from "@utils/storage";
import { settingsStore } from "./settingsStore.svelte";

class PropertyStore {
   private properties = $state<Property[]>([]);

   constructor() {
      this.properties = loadPropertiesFromStorage();
      if (settingsStore.debugLevel > 0) {
         console.log("properties cargadas: ", $state.snapshot(this.properties));
      }
   }

   saveProperties() {
      savePropertiesToStorage(this.properties);
      if (settingsStore.debugLevel > 0) {
         console.log("guardando notas", $state.snapshot(this.properties));
      }
   }

   getPropertyById(id: string): Property | undefined {
      return this.properties.find((properties) => properties.id === id);
   }

   getPropertiesFromIDs(id: Property["id"][]): Property[] {
      return this.properties.filter((property) => id.includes(property.id));
   }

   getAllProperties(): Property[] {
      return this.properties;
   }

   setProperties(newNotes: Property[]) {
      this.properties = newNotes;
      this.saveProperties();
   }

   createProperty(property: Property): void {
      this.properties = [...this.properties, property];
      this.saveProperties();
   }

   // Actualiza una nota en el array por ID aplicando un updater
   updatePropertyById(
      id: string,
      updater: (property: Property) => Property,
   ): void {
      const index = this.properties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.properties[index] = updater(this.properties[index]);
      }
      this.saveProperties();
   }

   removeProperty(id: string): void {
      this.properties = this.properties.filter(
         (property) => property.id !== id,
      );
      this.saveProperties();
   }
}

export let propertyStore = $state(new PropertyStore());
