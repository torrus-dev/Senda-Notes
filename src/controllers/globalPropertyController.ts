import type { Note } from "@projectTypes/noteTypes";
import type { Property, GlobalProperty } from "@projectTypes/propertyTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { propertyStore } from "@stores/propertyStore.svelte";
import { DateTime } from "luxon";

class GlobalPropertyController {
   get globalProperties() {
      return propertyStore.getGlobalProperties();
   }

   createGlobalProperty(
      name: GlobalProperty["name"],
      type: GlobalProperty["type"],
   ) {
      const newProperty: GlobalProperty = {
         id: crypto.randomUUID(),
         name: name,
         type: type,
         createdAt: DateTime.now(),
         updatedAt: DateTime.now(),
         linkedProperties: [],
      };
      propertyStore.createGlobalProperty(newProperty);
   }

   getGlobalPropertyById(id: GlobalProperty["id"]) {
      return propertyStore.getGlobalPropertyById(id);
   }
   getGlobalPropertyByName(name: GlobalProperty["name"]) {
      return propertyStore.getGlobalPropertyByName(name);
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

   changeGlobalPropertyType(
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
