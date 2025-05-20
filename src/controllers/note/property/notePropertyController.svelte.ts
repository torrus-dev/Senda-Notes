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

      // Comprobamos si hay una propiedad global con ese nombre
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

   createProperty = (
      noteId: string,
      name: NoteProperty["name"],
      type: NoteProperty["type"],
   ): void => {
      // Comprobamos si esta registrada globalmente
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);

      // Si ya existe una propiedad con ese nombre usamos el tipo definido globalmente
      const propertyType = existingGlobalProperty
         ? existingGlobalProperty.type
         : type;

      // generamos la nueva propiedad
      const newProperty: NoteProperty = generateProperty(name, propertyType);

      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);

      // Si no existe propiedad global con mismo nombre la registramos
      if (!existingGlobalProperty) {
         globalPropertyController.createGlobalProperty(
            newProperty.name,
            newProperty.type,
            newProperty,
         );
      }
   };

   localPropertyRename(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      // Comprobamos si hay una propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);

      // Propiedad que despues se usara para actualizar
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;
      propertyToUpdate.name = newPropertyName;

      if (existingGlobalProperty) {
         // Si hay propiedad global usamos su tipo
         propertyToUpdate.type = existingGlobalProperty.type;
      } else {
         // Creamos una nueva propiedad global con el tipo de la propiedad
         const propertyToUpdate = this.getPropertyById(noteId, propertyId);
         if (propertyToUpdate) {
            globalPropertyController.createGlobalProperty(
               newPropertyName,
               propertyToUpdate.type,
               propertyToUpdate,
            );
         }
      }

      this.updatePropertyFromNote(noteId, propertyId, propertyToUpdate);
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
