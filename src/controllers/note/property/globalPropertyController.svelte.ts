import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty } from "@projectTypes/propertyTypes";
import { globalPropertiesStore } from "@stores/globalPropertiesStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { removeDiacritics } from "@utils/searchUtils";
import { noteStore } from "@stores/noteStore.svelte";

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

   searchGlobalProperties(name: string, noteId?: Note["id"]): GlobalProperty[] {
      const allProperties = globalPropertiesStore.getGlobalProperties();
      const note = noteId ? noteStore.getNoteById(noteId) : undefined;

      // Crear un conjunto con los nombres normalizados de propiedades de la nota (si existe)
      const notePropertyNames = note
         ? new Set(
              note.properties.map((prop) =>
                 removeDiacritics(prop.name.toLowerCase()),
              ),
           )
         : new Set<string>();

      // Preparar el término de búsqueda normalizado (si existe)
      const searchTerm =
         name && name.trim() !== ""
            ? removeDiacritics(name.toLowerCase())
            : null;

      console.log("allProperties", allProperties);
      // Un solo filtro que combina ambas condiciones
      return allProperties.filter((property) => {
         // Normalizar el nombre de la propiedad una sola vez
         const normalizedPropertyName = removeDiacritics(
            property.name.toLowerCase(),
         );

         // Verificar que la propiedad no existe ya en la nota
         if (notePropertyNames.has(normalizedPropertyName)) return false;

         // Si no hay término de búsqueda, incluir la propiedad
         if (!searchTerm) return true;

         // Verificar si el nombre de la propiedad coincide con el término de búsqueda
         return normalizedPropertyName.includes(searchTerm);
      });
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
