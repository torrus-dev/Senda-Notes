import type { Property } from "@projectTypes/propertyTypes";
import type { Note } from "@projectTypes/noteTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { convertPropertyValue, generateProperty } from "@utils/propertyUtils";
import { globalPropertyController } from "./globalPropertyController";
import { noteController } from "./noteController.svelte";
import { propertyStore } from "@stores/propertyStore.svelte";

class NotePropertyController {
   private addPropertyToNote = (noteId: Note["id"], newProperty: Property) => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;
      const updatedProperties = [...note.properties, newProperty];
      noteController.updateNote(noteId, { properties: updatedProperties });
   };

   private removePropertyFromNote = (
      noteId: Note["id"],
      propertyToDeleteId: Property["id"],
   ) => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;
      const updatedProperties = note.properties.filter(
         (property) => property.id !== propertyToDeleteId,
      );
      noteController.updateNote(noteId, { properties: updatedProperties });
   };

   private updatePropertyFromNote = (
      noteId: Note["id"],
      propertyId: Property["id"],
      updatedProperty: Partial<Property>,
   ): void => {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;

      const updatedProperties: Property[] = note.properties.map((prop) => {
         if (prop.id === propertyId) {
            return {
               ...prop,
               ...updatedProperty,
            } as Property;
         }
         return prop;
      });

      noteController.updateNote(noteId, { properties: updatedProperties });
   };

   createProperty = (
      noteId: string,
      name: Property["name"],
      type: Property["type"],
   ): void => {
      // Comprobamos si esta registrada globalmente
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);

      // Si ya existe una propiedad con ese nombre usamos el tipo definido globalmente
      const propertyType = existingGlobalProperty
         ? existingGlobalProperty.type
         : type;

      // generamos la nueva propiedad
      const newProperty: Property = generateProperty(name, propertyType);

      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);

      // Si no existe propiedad global con mismo nombre la registramos
      if (!existingGlobalProperty) {
         globalPropertyController.createGlobalProperty(
            newProperty.name,
            newProperty.type,
         );
      }
   };

   renameNoteProperty(
      noteId: Note["id"],
      propertyId: Property["id"],
      newPropertyName: Property["name"],
   ) {
      // Comprobamos si hay una propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);

      // Propiedad que despues se usara para actualizar
      let updatedProperty: Partial<Property> = {
         name: newPropertyName,
      };
      if (existingGlobalProperty) {
         // Si hay propiedad global usamos su tipo
         updatedProperty.type = existingGlobalProperty.type;
      } else {
         // Creamos una nueva propiedad global con el tipo de la propiedad
         const propertyToUpdate = this.getPropertyById(noteId, propertyId);
         if (propertyToUpdate) {
            globalPropertyController.createGlobalProperty(
               newPropertyName,
               propertyToUpdate.type,
            );
         }
      }

      this.updatePropertyFromNote(noteId, propertyId, updatedProperty);
   }

   changeNotePropertyType(
      noteId: Note["id"],
      propertyId: Property["id"],
      newPropertyType: Property["type"],
   ) {}

   deleteProperty = (noteId: string, propertyId: string): void => {
      this.removePropertyFromNote(noteId, propertyId);
   };

   reorderNoteProperty = (
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): void => {
      // Verificamos que la propiedad exista
      const { note } = this.getPropertyOrThrowError(noteId, propertyId);
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

      this.updateNoteProperties(noteId, properties);
   };

   updateNotePropertyValue = (
      noteId: string,
      propertyId: string,
      value: Property["value"],
   ): void => {
      this.updateProperty(noteId, propertyId, { value });
   };

   renameNoteProperty = (
      noteId: string,
      propertyId: string,
      name: string,
   ): void => {
      this.updateProperty(noteId, propertyId, { name });
   };

   changeNotePropertyType = (
      noteId: string,
      propertyId: string,
      type: Property["type"],
   ): void => {
      this.updateProperty(noteId, propertyId, { type });
   };

   getNoteProperties = (noteId: string): Property[] => {
      const note = this.getNoteOrThrowError(noteId);
      return [...note.properties];
   };

   getPropertyById = (
      noteId: string,
      propertyId: string,
   ): Property | undefined => {
      try {
         const { property } = this.getPropertyOrThrowError(noteId, propertyId);
         return property;
      } catch (error) {
         return undefined;
      }
   };
}

export const notePropertyController = $state(new NotePropertyController());
