import type { Note } from "@projectTypes/noteTypes";
import type { Property } from "@projectTypes/propertyTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { propertyStore } from "@stores/propertyStore.svelte";
import { getDefaultTypeValue } from "@utils/propertyUtils";

class PropertyController {
   // API Pública
   createProperty(name: Property["name"], noteId?: Note["id"]): void {
      const existingLabel = propertyStore.getPropertyLabel(name);

      const propertyType = existingLabel ? existingLabel.type : "text";

      const newProperty: Property = {
         id: crypto.randomUUID(),
         name: name,
         type: propertyType,
         value: getDefaultTypeValue(propertyType),
      };

      propertyStore.createProperty(newProperty);
      if (noteId) {
         this.addPropertyToNote(newProperty.id, noteId);
      }

      // Registrar el label si no existe ninguno con ese nombre
      if (!existingLabel) {
         propertyStore.registerPropertyLabel(name, propertyType);
      }
   }

   updatePropertyById = (
      propertyId: Property["id"],
      updates: Partial<Property>,
   ) => {
      propertyStore.updatePropertyById(
         propertyId,
         (property) =>
            ({
               ...property,
               ...updates,
            }) as Property,
      );
   };

   updateProperty = (
      propertyId: Property["id"],
      updates: Partial<Property>,
   ): void => {
      const property = propertyStore.getPropertyById(propertyId);
      if (!property) return;

      // Caso especial para cambio de nombre
      if (updates.name && updates.name !== property.name) {
         // Si cambia el nombre, tratarlo como eliminación + creación
         const noteIds = this.findNotesWithProperty(propertyId);

         // Para cada nota que tiene esta propiedad
         noteIds.forEach((noteId) => {
            // Eliminar la propiedad con el nombre antiguo
            this.deletePropertyFromNote(propertyId, noteId);

            // Crear/añadir una nueva propiedad con el nuevo nombre
            // Aquí usamos el método createNewProperty que ya maneja los labels
            this.createProperty(updates.name!, noteId);
         });

         return; // No seguimos con la actualización normal
      }

      // Caso especial para cambio de tipo (solo actualizar el label si no hay cambio de nombre)
      if (updates.type && updates.type !== property.type && !updates.name) {
         const existingLabel = propertyStore.getPropertyLabel(property.name);
         if (existingLabel) {
            // Actualizar el tipo en el label
            propertyStore.updatePropertyLabel(property.name, updates.type);
         }
      }

      // Actualización normal de la propiedad
      this.updatePropertyById(propertyId, updates);
   };

   updatePropertyLabel(
      propertyId: Property["id"],
      updates: Partial<Property>,
   ): void {
      const property = propertyController.getPropertyById(propertyId);
      if (!property) return;
      //
      this.updatePropertyById(propertyId, updates);
   }

   updatePropertyValue(propertyId: string, value: Property["value"]): void {
      this.updateProperty(propertyId, { value });
   }

   updatePropertyName(propertyId: string, name: string): void {
      this.updateProperty(propertyId, { name });
   }

   changePropertyType(propertyId: string, type: Property["type"]): void {
      // lamar a función que intente transformar el value de la property
      this.updateProperty(propertyId, { type });
   }

   // Método auxiliar para encontrar todas las notas que usan una propiedad
   private findNotesWithProperty(propertyId: string): string[] {
      const allNotes = noteStore.getAllNotes();
      return allNotes
         .filter((note) => note.propertiesIDs.includes(propertyId))
         .map((note) => note.id);
   }

   deleteProperty(propertyId: string): void {
      propertyStore.removeProperty(propertyId);
   }

   deletePropertyFromNote(propertyId: string, noteId: string): void {
      const note = noteStore.getNoteById(noteId);
      if (!note) return;

      if (note.propertiesIDs.includes(propertyId)) {
         noteStore.updateNoteById(
            noteId,
            (currentNote) =>
               ({
                  ...currentNote,
                  propertiesIDs: currentNote.propertiesIDs.filter(
                     (id) => id !== propertyId,
                  ),
               }) as Note,
         );
      }
      // Verificamos si la propiedad ya no está en uso en ninguna nota
      this.deletePropertyIfUnused(propertyId);
   }
   private deletePropertyIfUnused(propertyId: string): void {
      const allNotes = noteStore.getAllNotes();
      const isPropertyUsed = allNotes.some((note) =>
         note.propertiesIDs.includes(propertyId),
      );

      // Si no está en uso en ninguna nota, la eliminamos
      if (!isPropertyUsed) {
         propertyStore.removeProperty(propertyId);
      }
   }

   addPropertyToNote(propertyId: Property["id"], noteId: Note["id"]) {
      const property = propertyStore.getPropertyById(propertyId);
      const note = noteStore.getNoteById(noteId);
      if (!property || !note) return;
      noteStore.updateNoteById(
         noteId,
         (currentNote) =>
            ({
               ...currentNote,
               propertiesIDs: [...currentNote.propertiesIDs, propertyId],
            }) as Note,
      );
   }

   getPropertyById(propertyId: Property["id"]): Property | undefined {
      try {
         return propertyStore.getPropertyById(propertyId);
      } catch {
         return undefined;
      }
   }
   getPropertyByName(propertyName: Property["name"]): Property | undefined {
      try {
         return propertyStore.getPropertyByName(propertyName);
      } catch {
         return undefined;
      }
   }
}

export const propertyController = $state(new PropertyController());
