import type { NoteProperty } from "@projectTypes/core/propertyTypes";
import type { Note } from "@domain/Note";
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { startupManager } from "@model/startup/startupManager.svelte";
import { generateProperty } from "@utils/propertyUtils";
import { normalizeText } from "@utils/searchUtils";

class NotePropertyController {
   private get noteRepository() {
      return startupManager.getService("noteRepository");
   }

   private get queryRepository() {
      return startupManager.getService("noteQueryRepository");
   }

   private addPropertyToNote = (noteId: string, newProperty: NoteProperty) => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.addProperty(newProperty);
      this.noteRepository.update(noteId, note);
   };

   /** Devuelve true si ya existe en la nota otra propiedad con ese nombre */
   isDuplicateName(
      noteId: string,
      name: string,
      excludePropertyId?: NoteProperty["id"],
   ): boolean {
      const props = this.getNoteProperties(noteId);
      const normalized = normalizeText(name.trim());
      return props
         .filter((p) => p.id !== excludePropertyId)
         .some((p) => normalizeText(p.name.trim()) === normalized);
   }

   handleCreateNoteProperty = (
      noteId: string,
      name: NoteProperty["name"],
      type: NoteProperty["type"],
   ): void => {
      if (this.isDuplicateName(noteId, name)) {
         console.warn(
            `No se puede crear: la nota ${noteId} ya tiene una propiedad "${name}".`,
         );
         return;
      }

      // Generamos la nueva propiedad
      const newProperty = generateProperty(noteId, name, type);

      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);

      // Importante: si no hacemos lo de arriba primero, la nota no "existira" y fallara la vinculación
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
   };

   deletePropertyFromNote = (
      noteId: string,
      propertyToDeleteId: NoteProperty["id"],
   ) => {
      const propertyToDelete = this.getPropertyById(noteId, propertyToDeleteId);
      if (!propertyToDelete) return;

      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.removeProperty(propertyToDeleteId);
      this.noteRepository.update(noteId, note);

      // Comprobamos si hay una propiedad global con ese nombre y la desvinculamos
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(
            propertyToDelete.name,
         );
      if (!existingGlobalProperty) return;

      globalPropertyController.unlinkFromGlobalProperty(propertyToDelete);
   };

   updatePropertyFromNote = (
      noteId: string,
      propertyId: NoteProperty["id"],
      updatedProperty: Partial<NoteProperty>,
   ): void => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      note.updateProperty(propertyId, updatedProperty);
      this.noteRepository.update(noteId, note);
   };

   getPropertyById = (
      noteId: string,
      propertyId: string,
   ): NoteProperty | undefined => {
      const note = this.queryRepository.findById(noteId);
      if (!note) return undefined;

      return note.properties.find((property) => property.id === propertyId);
   };

   renameNotePropertyById(
      noteId: string,
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;

      propertyToUpdate.name = newPropertyName;
      this.updatePropertyFromNote(noteId, propertyId, propertyToUpdate);
   }

   handleNotePropertyRename(
      noteId: string,
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      if (this.isDuplicateName(noteId, newPropertyName, propertyId)) {
         console.warn(
            `No se puede renombrar: la nota ${noteId} ya tiene una propiedad "${newPropertyName}".`,
         );
         return;
      }

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
      noteId: string,
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
      const note = this.queryRepository.findById(noteId);
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

      note.updateProperties(properties);
      this.noteRepository.update(noteId, note);
   };

   updateNotePropertyValue = (
      noteId: string,
      propertyId: string,
      newValue: NoteProperty["value"],
   ): void => {
      this.updatePropertyFromNote(noteId, propertyId, { value: newValue });
   };

   getNoteProperties = (noteId: string): NoteProperty[] => {
      const note = this.queryRepository.findById(noteId);
      return note ? note.properties : [];
   };
}

export const notePropertyController = $state(new NotePropertyController());
