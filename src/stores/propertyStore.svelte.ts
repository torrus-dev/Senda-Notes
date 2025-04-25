import type { Property } from "@projectTypes/propertyTypes";
import {
   loadPropertiesFromStorage,
   savePropertiesToStorage,
} from "@utils/storage";
import { settingsStore } from "./settingsStore.svelte";

interface PropertyLabel {
   name: Property["name"];
   type: Property["type"];
}

class PropertyStore {
   private propertyLabels = $state<PropertyLabel[]>([]);
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

   getPropertyById(id: Property["id"]): Property | undefined {
      return this.properties.find((properties) => properties.id === id);
   }
   getPropertyByName(propertyName: Property["name"]): Property | undefined {
      return this.properties.find(
         (properties) => properties.name === propertyName,
      );
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

   registerPropertyLabel(
      propertyName: Property["name"],
      propertyType: Property["type"],
   ): void {
      this.propertyLabels.push({ name: propertyName, type: propertyType });
   }

   updatePropertyLabel(
      propertyName: Property["name"],
      newPropertyType: Property["type"],
   ): void {
      const index = this.propertyLabels.findIndex((label) => label.name === propertyName);
      if (index !== -1) {
         this.propertyLabels[index] = { name: propertyName, type: newPropertyType };
      }
   }

   unregisterPropertyLabel(propertyName: Property["name"]) {
      this.propertyLabels = this.propertyLabels.filter(
         (label) => label.name !== propertyName,
      );
   }

   getPropertyLabel(propertyName: Property["name"]): PropertyLabel | undefined {
      return this.propertyLabels.find((label) => label.name === propertyName);
   }
}

export let propertyStore = $state(new PropertyStore());
