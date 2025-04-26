import type { Property } from "@projectTypes/propertyTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { convertPropertyValue, generateProperty } from "@utils/propertyUtils";
import { globalPropertyController } from "./globalPropertyController";
import { propertyStore } from "@stores/propertyStore.svelte";

class NotePropertyController {
   constructor() {}

   // Funciones auxiliares para las notas
   private getNoteOrThrowError = (noteId: string) => {
      const note = noteStore.getNoteById(noteId);
      if (!note) {
         throw new Error(`Note ${noteId} not found`);
      }
      return note;
   };

   private getPropertyOrThrowError = (noteId: string, propertyId: string) => {
      const note = this.getNoteOrThrowError(noteId);
      const property = note.properties.find((p) => p.id === propertyId);
      if (!property) {
         throw new Error(`Property ${propertyId} not found in note ${noteId}`);
      }
      return { note, property };
   };

   private updateNoteProperties = (
      noteId: string,
      newProperties: Property[],
   ) => {
      noteStore.updateNoteById(noteId, (note) => ({
         ...note,
         properties: newProperties,
      }));
   };

   // Funciones públicas
   createProperty = (
      noteId: string,
      name: Property["name"],
      type: Property["type"],
   ): void => {
      const note = this.getNoteOrThrowError(noteId);
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);

      const propertyType = existingGlobalProperty
         ? existingGlobalProperty.type
         : type;

      const newProperty: Property = generateProperty(name, propertyType);

      const updatedProperties = [...note.properties, newProperty];
      this.updateNoteProperties(noteId, updatedProperties);
      // Si la propiedad no existia la registramos globalmente
      if (!existingGlobalProperty) {
         propertyStore.createGlobalProperty({
            id: newProperty.id,
            name: newProperty.name,
            type: newProperty.type,
         });
      }
   };

   updateProperty = (
      noteId: string,
      propertyId: string,
      updates: Partial<Omit<Property, "id">>,
   ): void => {
      const { note, property } = this.getPropertyOrThrowError(
         noteId,
         propertyId,
      );

      const updatedProperties: Property[] = note.properties.map((prop) => {
         if (prop.id === propertyId) {
            // actualizamos la nota
            // si hay cambio de tipo
            if (updates.type && updates.type !== prop.type) {
               return {
                  ...prop,
                  type: updates.type,
                  value: convertPropertyValue(prop.type, updates.type),
               } as Property;
            }
            return {
               ...prop,
               ...updates,
               value: updates.value !== undefined ? updates.value : prop.value,
            } as Property;
         }
         return prop;
      });

      this.updateNoteProperties(noteId, updatedProperties);
   };

   deleteProperty = (noteId: string, propertyId: string): void => {
      this.getPropertyOrThrowError(noteId, propertyId);

      const note = this.getNoteOrThrowError(noteId);
      const updatedProperties = note.properties.filter(
         (p) => p.id !== propertyId,
      );

      this.updateNoteProperties(noteId, updatedProperties);
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
