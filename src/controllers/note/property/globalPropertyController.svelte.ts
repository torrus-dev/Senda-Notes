import type { GlobalProperty } from "@projectTypes/propertyTypes";
import { propertyStore } from "@stores/propertyStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";

class GlobalPropertyController {
   getGlobalPropertyById(id: GlobalProperty["id"]) {
      return propertyStore.getGlobalPropertyById(id);
   }

   getGlobalPropertyByName(name: GlobalProperty["name"]) {
      return propertyStore.getGlobalPropertyByName(name);
   }

   createGlobalProperty(
      name: GlobalProperty["name"],
      type: GlobalProperty["type"],
   ) {
      const newProperty = generateGlobalProperty(name, type);
      propertyStore.createGlobalProperty(newProperty);
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updates: Partial<GlobalProperty>,
   ) {
      const globalProperty = propertyStore.getGlobalPropertyById(id);
      if (!globalProperty) return;
      propertyStore.updateGlobalPropertyById(id, (globalProperty) => ({
         ...globalProperty,
         ...updates,
      }));
   }

   updateGlobalPropertyType(
      id: GlobalProperty["id"],
      type: GlobalProperty["type"],
   ) {
      this.updateGlobalPropertyById(id, { type: type });
   }

   renameGlobalProperty(
      id: GlobalProperty["id"],
      name: GlobalProperty["name"],
   ) {
      this.updateGlobalPropertyById(id, { name: name });
   }

   deleteGlobalPropertyById(id: GlobalProperty["id"]) {
      propertyStore.removeProperty(id);
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
