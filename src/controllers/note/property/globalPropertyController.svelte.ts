import type { Note } from "@projectTypes/noteTypes";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { globalPropertiesStore } from "modal/globalPropertiesStore.svelte";
import { generateGlobalProperty } from "@utils/propertyUtils";
import { removeDiacritics } from "@utils/searchUtils";
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

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
      // Generar y registrar la propiedad global
      const newGlobalProperty = generateGlobalProperty(name, type);
      globalPropertiesStore.createGlobalProperty(newGlobalProperty);

      // Vincular la propiedad de nota que crea la propiedad global a esta
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
      newPropertyName: GlobalProperty["name"],
   ) {
      // Buscamos y cambiamos el nombre a la propiedad global
      const globalProperty = this.getGlobalPropertyById(id);
      if (!globalProperty) return;
      // Comprobamos si ya existe
      const globalPropertyNameMatch =
         this.getGlobalPropertyByName(newPropertyName);
         if(!globalPropertyNameMatch) {
            this.updateGlobalPropertyById(id, { name: newPropertyName });
         } else {
            // metodo y dialogo para combinar propiedad a la que tiene el nuevo nombre
         }

      // Recorremos las note properties vinculadas a la propiedad global y actualizamos el nombre
      globalProperty.linkedProperties.forEach(({ noteId, propertyId }) => {
         notePropertyController.renameNotePropertyById(
            noteId,
            propertyId,
            newPropertyName,
         );
      });
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
      // 1) Desvincular a la propiedad global anterior
      this.unlinkFromGlobalProperty(noteProperty);

      // 2) Actualizar la global: añadir el enlace
      const newLink = {
         noteId: noteProperty.noteId,
         propertyId: noteProperty.id,
      };
      this.updateGlobalPropertyById(globalProperty.id, {
         linkedProperties: [...globalProperty.linkedProperties, newLink],
      });

      // 3) Actualizar la propiedad local (en la nota) para fijar globalPropertyId
      notePropertyController.updatePropertyFromNote(
         noteProperty.noteId,
         noteProperty.id,
         {
            globalPropertyId: globalProperty.id,
            name: globalProperty.name,
            // No actualizamos el tipo, mostraremos un aviso en la UI del missmatch
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
      const { globalPropertyId } = deletedNoteProperty;
      if (!globalPropertyId) return;
      const globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) return;

      // Filtrar las noteProperties enlazadas con la global
      const filteredLinks = globalProperty.linkedProperties.filter(
         (link) =>
            !(
               link.noteId === deletedNoteProperty.noteId &&
               link.propertyId === deletedNoteProperty.id
            ),
      );
      this.updateGlobalPropertyById(globalPropertyId, {
         linkedProperties: filteredLinks,
      });

      // No eliminamos de la nota, ya que siempre tendran un globalPropertyId y esta función debe usarse solo al eliminar noteProperties o las propiedades se desincronizaran.
   }

   checkTypeMatch(noteProperty: NoteProperty): boolean {
      const { globalPropertyId } = noteProperty;

      if (!globalPropertyId) return false;

      let globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) {
         console.warn(
            "No se ha encontrado ninguna propiedad global enlazada a esta propiedad",
         );
      } else if (noteProperty.type === globalProperty.type) {
         return true;
      }
      return false;
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
