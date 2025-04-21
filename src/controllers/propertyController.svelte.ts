import type { Property } from "@projectTypes/noteTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { getDefaultTypeValue } from "@utils/propertyUtils";

class PropertyController {
   constructor() {}

   // Funciones auxiliares privadas
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

   createProperty = (
      noteId: string,
      property: Omit<Property, "id">,
   ): string => {
      const note = this.getNoteOrThrowError(noteId);

      const newProperty: Property = {
         ...property,
         id: crypto.randomUUID(),
         value: property.value ?? getDefaultTypeValue(property.type),
      };

      const updatedProperties = [...note.properties, newProperty];
      this.updateNoteProperties(noteId, updatedProperties);

      return newProperty.id;
   };

   updateProperty = (
      noteId: string,
      propertyId: string,
      updates: Partial<Omit<Property, "id">>,
   ): void => {
      const { note } = this.getPropertyOrThrowError(noteId, propertyId);

      const updatedProperties = note.properties.map((prop) => {
         if (prop.id === propertyId) {
            const newType = updates.type ?? prop.type;

            return {
               ...prop,
               ...updates,
               value:
                  updates.type !== undefined
                     ? getDefaultTypeValue(newType)
                     : (updates.value ?? prop.value),
               type: newType,
            };
         }
         return prop;
      });

      this.updateNoteProperties(noteId, updatedProperties);
   };

   deleteProperty = (noteId: string, propertyId: string): void => {
      // Verificamos que la propiedad exista antes de intentar eliminarla
      this.getPropertyOrThrowError(noteId, propertyId);

      // Obtenemos la nota de nuevo para asegurarnos de tener la versión más reciente
      const note = this.getNoteOrThrowError(noteId);
      const updatedProperties = note.properties.filter(
         (p) => p.id !== propertyId,
      );

      this.updateNoteProperties(noteId, updatedProperties);
   };

   reorderProperty = (
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

   updatePropertyValue = (
      noteId: string,
      propertyId: string,
      value: Property["value"],
   ): void => {
      this.updateProperty(noteId, propertyId, { value });
   };

   updatePropertyName = (
      noteId: string,
      propertyId: string,
      name: string,
   ): void => {
      this.updateProperty(noteId, propertyId, { name });
   };

   changePropertyType = (
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

   batchCreateProperties = (
      noteId: string,
      properties: Array<Omit<Property, "id">>,
   ): string[] => {
      const note = this.getNoteOrThrowError(noteId);

      const newProperties = properties.map((prop) => ({
         ...prop,
         id: crypto.randomUUID(),
         value: prop.value ?? getDefaultTypeValue(prop.type),
      }));

      const updatedProperties = [...note.properties, ...newProperties];
      this.updateNoteProperties(noteId, updatedProperties);

      return newProperties.map((prop) => prop.id);
   };

   hasPropertyWithName = (noteId: string, propertyName: string): boolean => {
      try {
         const note = this.getNoteOrThrowError(noteId);
         return note.properties.some((p) => p.name === propertyName);
      } catch (error) {
         return false;
      }
   };
}

export const propertyController = $state(new PropertyController());
