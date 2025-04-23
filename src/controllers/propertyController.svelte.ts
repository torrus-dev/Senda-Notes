import type {
   Property,
   TextProperty,
   ListProperty,
   NumberProperty,
   CheckProperty,
   DateProperty,
   DateTimeProperty,
} from "@projectTypes/propertyTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { DateTime } from "luxon";

class PropertyController {
   // Valores por defecto para cada tipo de propiedad
   private defaultValues: Record<Property["type"], any> = {
      text: "",
      list: [],
      number: 0,
      check: false,
      date: () => new Date(),
      datetime: () => DateTime.now(),
   };

   /**
    * Crea una propiedad con el tipo especificado y valores adecuados
    */
   private createPropertyWithType<T extends Property["type"]>(
      baseProps: Omit<Property, "value" | "type"> & {
         value?: any;
         type: T;
      },
   ): Property {
      const { type, value } = baseProps;
      const defaultValue =
         typeof this.defaultValues[type] === "function"
            ? this.defaultValues[type]()
            : this.defaultValues[type];

      return {
         ...baseProps,
         value: value ?? defaultValue,
         type,
      } as Property;
   }

   /**
    * Obtiene una nota por ID o lanza un error
    */
   private getNoteOrThrow(noteId: string) {
      const note = noteStore.getNoteById(noteId);
      if (!note) {
         throw new Error(`Note ${noteId} not found`);
      }
      return note;
   }

   /**
    * Obtiene una propiedad de una nota o lanza un error
    */
   private getPropertyOrThrow(noteId: string, propertyId: string) {
      const note = this.getNoteOrThrow(noteId);
      const property = note.properties.find((p) => p.id === propertyId);
      if (!property) {
         throw new Error(`Property ${propertyId} not found in note ${noteId}`);
      }
      return { note, property };
   }

   /**
    * Actualiza las propiedades de una nota
    */
   private updateNoteProperties(noteId: string, properties: Property[]) {
      noteStore.updateNoteById(noteId, (note) => ({
         ...note,
         properties,
      }));
   }

   // API Pública

   /**
    * Crea una nueva propiedad en una nota
    */
   createProperty(noteId: string, property: Omit<Property, "id">): string {
      const note = this.getNoteOrThrow(noteId);
      const newProperty = this.createPropertyWithType({
         ...property,
         id: crypto.randomUUID(),
      });

      this.updateNoteProperties(noteId, [...note.properties, newProperty]);
      return newProperty.id;
   }

   /**
    * Actualiza una propiedad existente
    */
   updateProperty(
      noteId: string,
      propertyId: string,
      updates: Partial<Omit<Property, "id">>,
   ): void {
      const { note, property } = this.getPropertyOrThrow(noteId, propertyId);

      const updatedProperties = note.properties.map((prop) => {
         if (prop.id !== propertyId) return prop;

         // Si hay cambio de tipo, reseteamos el valor
         if (updates.type && updates.type !== prop.type) {
            return this.createPropertyWithType({
               ...prop,
               ...updates,
               value: undefined, // Valor por defecto para el nuevo tipo
            });
         }

         // Actualización normal
         return this.createPropertyWithType({
            ...prop,
            ...updates,
            value: updates.value !== undefined ? updates.value : prop.value,
         });
      });

      this.updateNoteProperties(noteId, updatedProperties);
   }

   /**
    * Elimina una propiedad de una nota
    */
   deleteProperty(noteId: string, propertyId: string): void {
      // Verificamos que la propiedad exista
      this.getPropertyOrThrow(noteId, propertyId);

      // Filtramos la propiedad de la lista
      const note = this.getNoteOrThrow(noteId);
      const updatedProperties = note.properties.filter(
         (p) => p.id !== propertyId,
      );

      this.updateNoteProperties(noteId, updatedProperties);
   }

   /**
    * Reordena una propiedad a una nueva posición
    */
   reorderProperty(
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): void {
      const { note } = this.getPropertyOrThrow(noteId, propertyId);
      const properties = [...note.properties];
      const currentIndex = properties.findIndex((p) => p.id === propertyId);

      // Validaciones de posición
      if (newPosition < 0) {
         throw new Error(`Invalid position: ${newPosition}. Must be >= 0`);
      }

      // Ajustar posición si es mayor que el límite
      const adjustedPosition = Math.min(newPosition, properties.length - 1);

      // No hacer nada si la posición es la misma
      if (currentIndex === adjustedPosition) return;

      // Reordenar
      const [propertyToMove] = properties.splice(currentIndex, 1);
      properties.splice(adjustedPosition, 0, propertyToMove);

      this.updateNoteProperties(noteId, properties);
   }

   // Métodos de conveniencia

   /**
    * Actualiza solo el valor de una propiedad
    */
   updatePropertyValue(
      noteId: string,
      propertyId: string,
      value: Property["value"],
   ): void {
      this.updateProperty(noteId, propertyId, { value });
   }

   /**
    * Actualiza solo el nombre de una propiedad
    */
   updatePropertyName(noteId: string, propertyId: string, name: string): void {
      this.updateProperty(noteId, propertyId, { name });
   }

   /**
    * Cambia el tipo de una propiedad
    */
   changePropertyType(
      noteId: string,
      propertyId: string,
      type: Property["type"],
   ): void {
      this.updateProperty(noteId, propertyId, { type });
   }

   /**
    * Obtiene todas las propiedades de una nota
    */
   getNoteProperties(noteId: string): Property[] {
      return [...this.getNoteOrThrow(noteId).properties];
   }

   /**
    * Busca una propiedad por su ID
    */
   getPropertyById(noteId: string, propertyId: string): Property | undefined {
      try {
         return this.getPropertyOrThrow(noteId, propertyId).property;
      } catch {
         return undefined;
      }
   }

   /**
    * Crea varias propiedades a la vez
    */
   batchCreateProperties(
      noteId: string,
      properties: Array<Omit<Property, "id">>,
   ): string[] {
      const note = this.getNoteOrThrow(noteId);

      const newProperties = properties.map((prop) =>
         this.createPropertyWithType({
            ...prop,
            id: crypto.randomUUID(),
         }),
      );

      this.updateNoteProperties(noteId, [...note.properties, ...newProperties]);
      return newProperties.map((prop) => prop.id);
   }

   /**
    * Verifica si ya existe una propiedad con el nombre dado
    */
   hasPropertyWithName(noteId: string, propertyName: string): boolean {
      try {
         return this.getNoteOrThrow(noteId).properties.some(
            (p) => p.name === propertyName,
         );
      } catch {
         return false;
      }
   }
}

export const propertyController = $state(new PropertyController());
