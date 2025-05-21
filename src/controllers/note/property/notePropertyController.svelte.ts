import type { NoteProperty } from "@projectTypes/propertyTypes";
import type { Note } from "@projectTypes/noteTypes";
import { generateProperty } from "@utils/propertyUtils";
import { noteStore } from "@stores/noteStore.svelte";
import { globalPropertyController } from "@controllers/note/property/globalPropertyController.svelte";
import { noteController } from "@controllers/note/noteController.svelte";

class NotePropertyController {
   private addPropertyToNote = (
      noteId: Note["id"],
      newProperty: NoteProperty,
   ) => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;
      const updatedProperties = [...note.properties, newProperty];
      noteController.updateNote(noteId, { properties: updatedProperties });
   };

   handleCreateNoteProperty = (
      noteId: string,
      name: NoteProperty["name"],
      type: NoteProperty["type"],
   ): void => {
      // Generamos la nueva propiedad
      const newProperty: NoteProperty = generateProperty(name, type);

      // Comprobamos si existe propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);
      if (existingGlobalProperty) {
         // Vinculamos a la propiedad global si existe
         globalPropertyController.linkToGlobalProperty(
            newProperty,
            existingGlobalProperty,
         );
      } else {
         // Creamos la propiedad global si no existe
         globalPropertyController.createGlobalProperty(name, type, newProperty);
      }

      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);
   };

   deletePropertyFromNote = (
      noteId: Note["id"],
      propertyToDeleteId: NoteProperty["id"],
   ) => {
      const propertyToDelete = this.getPropertyById(noteId, propertyToDeleteId);
      if (!propertyToDelete) return;
      const note = noteStore.getNoteById(noteId);
      if (!note) return;
      const updatedProperties = note.properties.filter(
         (property) => property.id !== propertyToDeleteId,
      );
      noteController.updateNote(noteId, { properties: updatedProperties });

      // Comprobamos si hay una propiedad global con ese nombre y la desvinculamos
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(
            propertyToDelete.name,
         );
      if (!existingGlobalProperty) return;
      globalPropertyController.unlinkFromGlobalProperty(propertyToDelete);
   };

   updatePropertyFromNote = (
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      updatedProperty: Partial<NoteProperty>,
   ): void => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;

      const updatedProperties: NoteProperty[] = note.properties.map((prop) => {
         if (prop.id === propertyId) {
            return {
               ...prop,
               ...updatedProperty,
            } as NoteProperty;
         }
         return prop;
      });

      noteController.updateNote(noteId, { properties: updatedProperties });
   };

   getPropertyById = (
      noteId: string,
      propertyId: string,
   ): NoteProperty | undefined => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return undefined;
      return note.properties.find((property) => property.id === propertyId);
   };

   renameNotePropertyById(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;
      propertyToUpdate.name = newPropertyName;
      this.updatePropertyFromNote(noteId, propertyId, propertyToUpdate);
   }

   handleNotePropertyRename(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      // Buscamos que exista una propiedad por esos Ids y la renombramos
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;
      this.renameNotePropertyById(noteId, propertyId, newPropertyName);

      // Comprobamos si existe propiedad global con el nuevo nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);

      if (existingGlobalProperty) {
         // Si existe propiedad global se vincula a la propiedad
         globalPropertyController.linkToGlobalProperty(
            propertyToUpdate,
            existingGlobalProperty,
         );
      } else {
         // Si no existe propiedad global, la creamos con nombre y tipo
         globalPropertyController.createGlobalProperty(
            newPropertyName,
            propertyToUpdate.type,
            propertyToUpdate,
         );
      }
   }

   changeNotePropertyType(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyType: NoteProperty["type"],
   ) {
      const property = this.getPropertyById(noteId, propertyId);
      if (!property) return;

      // Comprobamos si hay una propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(property.name);

      if (!existingGlobalProperty) return;

      // Actualizamos la propiedad
      this.updatePropertyFromNote(noteId, propertyId, {
         type: newPropertyType,
      });

      // Cambiamos el tipo de la propiedad global
      globalPropertyController.updateGlobalPropertyType(
         existingGlobalProperty.id,
         newPropertyType,
      );
   }

   reorderNoteProperties = (
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): void => {
      // Verificamos que la propiedad exista
      const note = noteStore.getNoteById(noteId);
      if (!note) return;
      const properties = [...note.properties];

      const currentIndex = properties.findIndex((p) => p.id === propertyId);

      // Validar que la nueva posición no sea negativa
      if (newPosition < 0) {
         throw new Error(
            `Invalid position: ${newPosition}. Must be greater than or equal to 0`,
         );
      }

      // Si la posición es mayor que la longitud, colocar al final
      if (newPosition >= properties.length) {
         newPosition = properties.length - 1;
      }

      // No hacer nada si la posición es la misma
      if (currentIndex === newPosition) {
         return;
      }

      // Extraer la propiedad que se va a mover
      const [propertyToMove] = properties.splice(currentIndex, 1);

      // Insertar la propiedad en la nueva posición
      properties.splice(newPosition, 0, propertyToMove);

      noteController.updateNote(noteId, { properties: properties });
   };

   updateNotePropertyValue = (
      noteId: string,
      propertyId: string,
      newValue: NoteProperty["value"],
   ): void => {
      this.updatePropertyFromNote(noteId, propertyId, { value: newValue });
   };

   getNoteProperties = (noteId: string): NoteProperty[] => {
      const note = noteStore.getNoteById(noteId);
      return note ? note.properties : [];
   };
}

export const notePropertyController = $state(new NotePropertyController());
