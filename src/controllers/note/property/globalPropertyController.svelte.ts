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
      noteProperty: NoteProperty,
   ) {
      const newGlobalProperty = generateGlobalProperty(name, type);
      globalPropertiesStore.createGlobalProperty(newGlobalProperty);
      this.linkToGlobalProperty(noteProperty, newGlobalProperty);
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
      // Preparar el término de búsqueda normalizado (si existe)
      const searchTerm = name?.trim()
         ? removeDiacritics(name.toLowerCase())
         : "";

      // Recorremos las propiedades globales filtrandolas
      return globalPropertiesStore.getGlobalProperties().filter((property) => {
         if (
            noteId &&
            property.linkedProperties.some((link) => link.noteId === noteId)
         ) {
            // Si hay noteId y la nota ya contiene una propiedad enlazada a la propiedad global actual, no la sugerimos
            return false;
         }

         // Si no hay termino de busqueda sugerimos la propiedad global actual
         if (!searchTerm) return true;

         // Comprobamos si la propiedad global despues de preparar el nombre coincide con el termino de busqueda
         return removeDiacritics(property.name.toLowerCase()).includes(
            searchTerm,
         );
      });
   }

   linkToGlobalProperty(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ) {
      // 1) Actualizar la global: añadir el enlace
      const newLink = {
         noteId: noteProperty.noteId,
         propertyId: noteProperty.id,
      };
      this.updateGlobalPropertyById(globalProperty.id, {
         linkedProperties: [...globalProperty.linkedProperties, newLink],
      });

      // 2) Actualizar la propiedad local (en la nota) para fijar globalPropertyId
      notePropertyController.updatePropertyFromNote(
         noteProperty.noteId,
         noteProperty.id,
         {
            globalPropertyId: globalProperty.id,
            name: globalProperty.name,
            // No actualizamos el tipo mostraremos un aviso en la UI del missmatch
            // type: globalProperty.type,
         },
      );
   }

   /**
    * Usado al eliminar notas de propiedades
    *
    * @param deletedNoteProperty
    */
   unlinkFromGlobalProperty(deletedNoteProperty: NoteProperty) {
      const globalId = deletedNoteProperty.globalPropertyId;
      const globalProperty = this.getGlobalPropertyById(globalId);
      if (!globalProperty) return;

      // Filtrar las noteProperties enlazadas con la global
      const filteredLinks = globalProperty.linkedProperties.filter(
         (link) =>
            !(
               link.noteId === deletedNoteProperty.noteId &&
               link.propertyId === deletedNoteProperty.id
            ),
      );
      this.updateGlobalPropertyById(globalId, {
         linkedProperties: filteredLinks,
      });

      // No eliminamos de la nota, ya que siempre tendran un globalPropertyId y esta función debe usarse solo al eliminar noteProperties o las propiedades se desincronizaran.
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
