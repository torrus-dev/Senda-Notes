import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty } from "@projectTypes/propertyTypes";
import { globalPropertiesStore } from "@stores/globalPropertiesStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { removeDiacritics } from "@utils/searchUtils";

class GlobalPropertyController {
   getGlobalPropertyById(id: GlobalProperty["id"]): GlobalProperty | undefined {
      return globalPropertiesStore.getGlobalPropertyById(id);
   }

   getGlobalPropertyByName(name: GlobalProperty["name"]) {
      return globalPropertiesStore.getGlobalPropertyByName(name);
   }

   createGlobalProperty(
      name: GlobalProperty["name"],
      type: GlobalProperty["type"],
   ) {
      const newProperty = generateGlobalProperty(name, type);
      globalPropertiesStore.createGlobalProperty(newProperty);
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updates: Partial<GlobalProperty>,
   ) {
      const globalProperty = globalPropertiesStore.getGlobalPropertyById(id);
      if (!globalProperty) return;
      globalPropertiesStore.updateGlobalPropertyById(id, (globalProperty) => ({
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
      globalPropertiesStore.deleteGlobalProperty(id);
   }

   getGlobalProperties() {
      return globalPropertiesStore.getGlobalProperties();
   }

   getGlobalPropertiesSuggestions(
      name: string,
      noteId?: Note["id"],
   ): GlobalProperty[] {
      const allGlobalProperties = globalPropertiesStore.getGlobalProperties();

      // Preparar el término de búsqueda normalizado (si existe)
      const searchTerm =
         name && name.trim() !== ""
            ? removeDiacritics(name.toLowerCase())
            : undefined;

      // Recorrer las propiedades globales y filtrarlas
      return allGlobalProperties.filter((property) => {
         // Normalizar el nombre de la propiedad una sola vez
         const normalizedPropertyName = removeDiacritics(
            property.name.toLowerCase(),
         );

         // Si hay un noteId, verificar si esta propiedad ya está vinculada a la nota
         if (noteId) {
            const isAlreadyLinked = property.linkedProperties.some(
               (link) => link.noteId === noteId,
            );
            if (isAlreadyLinked) return false;
         }

         // Si no hay término de búsqueda, incluir la propiedad
         if (!searchTerm) return true;

         // Verificar si el nombre de la propiedad coincide con el término de búsqueda
         return normalizedPropertyName.includes(searchTerm);
      });
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
