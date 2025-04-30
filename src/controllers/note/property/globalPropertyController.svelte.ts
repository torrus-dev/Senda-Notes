import type { GlobalProperty } from "@projectTypes/propertyTypes";
import { propertyStore } from "@stores/propertyStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { removeDiacritics } from "@utils/searchUtils";

class GlobalPropertyController {
   getGlobalPropertyById(id: GlobalProperty["id"]): GlobalProperty | undefined {
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

   searchGlobalProperties(name: string): GlobalProperty[] {
      const allProperties = propertyStore.getGlobalProperties();

      // Si no hay texto de búsqueda, retornar todas las propiedades
      if (!name || name.trim() === "") {
         console.log("busqueda vacia");
         return allProperties;
      }

      // Convertir a minúsculas y normalizar para una búsqueda más flexible
      const searchTerm = removeDiacritics(name.toLowerCase());
      console.log("search term", searchTerm);

      // Filtrar propiedades cuyo nombre normalizado contiene el término de búsqueda
      return allProperties.filter((property) => {
         const normalizedPropertyName = removeDiacritics(
            property.name.toLowerCase(),
         );
         return normalizedPropertyName.includes(searchTerm);
      });
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
