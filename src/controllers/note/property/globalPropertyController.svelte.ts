import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { globalPropertiesStore } from "@stores/globalPropertiesStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { removeDiacritics } from "@utils/searchUtils";
import { notePropertyController } from "./notePropertyController.svelte";

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
      property: NoteProperty,
   ) {
      const newGlobalProperty = generateGlobalProperty(name, type, property);
      globalPropertiesStore.createGlobalProperty(newGlobalProperty);
   }

   private updateGlobalPropertyById(
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
      newName: GlobalProperty["name"],
   ) {
      const globalProperty = this.getGlobalPropertyById(id);
      if (!globalProperty) return;
      this.updateGlobalPropertyById(id, { name: newName });
      for (const linkedProperty of globalProperty.linkedProperties) {
         const { noteId, propertyId } = linkedProperty;
         const property = notePropertyController.getPropertyById(
            noteId,
            propertyId,
         );
         if (!property) return;

         let updatedProperty: Partial<NoteProperty> = {
            name: newName,
         };

         notePropertyController.updatePropertyFromNote(
            noteId,
            propertyId,
            updatedProperty,
         );
      }
   }

   deleteGlobalPropertyById(id: GlobalProperty["id"]) {
      const globalProperty = this.getGlobalPropertyById(id);
      if (!globalProperty) return;
      if (globalProperty.linkedProperties.length > 0) {
         console.warn("Cannot delete global property in use!");
      } else {
         globalPropertiesStore.deleteGlobalProperty(id);
      }
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

   linkToGlobalProperty(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ) {
      // completar
   }
   unlinkFromGlobalProperty(noteProperty: NoteProperty) {
      // completar
   }

   updateGlobalType(
      globalProperty: GlobalProperty,
      newType: NoteProperty["type"],
   ) {
      // completar
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
