import type { Note } from "@projectTypes/noteTypes";
import type { Property } from "@projectTypes/propertyTypes";
import { noteStore } from "@stores/noteStore.svelte";
import { propertyStore } from "@stores/propertyStore.svelte";
import { getDefaultTypeValue } from "@utils/propertyUtils";

class PropertyController {
   // API Pública
   createNewProperty(
      name: Property["name"],
      noteId?: Note["id"],
   ): Property["id"] {
      const newProperty: Property = {
         id: crypto.randomUUID(),
         name: name,
         type: "text",
         value: getDefaultTypeValue("text"),
      };
      propertyStore.createProperty(newProperty);

      if (noteId) {
         this.addPropertyToNote(newProperty.id, noteId);
      }

      return newProperty.id;
   }

   updateProperty = (propertyId: string, updates: Partial<Property>): void => {
      const property = propertyStore.getPropertyById(propertyId);

      if (!property) return;

      propertyStore.updatePropertyById(
         propertyId,
         (property) =>
            ({
               ...property,
               ...updates,
            }) as Property,
      );
   };

   deleteProperty(propertyId: string): void {
      noteStore.removeNote(propertyId);
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

   // Métodos de conveniencia
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

   getPropertyById(propertyId: Property["id"]): Property | undefined {
      try {
         return propertyStore.getPropertyById(propertyId);
      } catch {
         return undefined;
      }
   }
   getPropertyByName(propertyId: Property["name"]): Property | undefined {
      try {
         return propertyStore.getPropertyById(propertyId);
      } catch {
         return undefined;
      }
   }
}

export const propertyController = $state(new PropertyController());
