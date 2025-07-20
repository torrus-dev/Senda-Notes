import { Note } from "@domain/entities/Note";
import {
   NoteProperty,
   type PropertyType,
   type PropertyValue,
} from "@domain/entities/NoteProperty";
import { GlobalProperty } from "@domain/entities/GlobalProperty";
import { normalizeText } from "@utils/searchUtils";

/**
 * Servicio de dominio simplificado para propiedades
 * Maneja las operaciones principales sin complejidad excesiva
 */
export class PropertyService {
   // ============================================================================
   // OPERACIONES PRINCIPALES
   // ============================================================================

   /**
    * Crea una propiedad en una nota con vinculación automática a propiedades globales
    */
   createNoteProperty(
      note: Note,
      name: string,
      type: PropertyType,
      globalProperties: GlobalProperty[],
      value?: PropertyValue,
   ): {
      noteProperty: NoteProperty;
      globalProperty: GlobalProperty;
      wasLinked: boolean;
   } {
      // Validar nombre duplicado
      if (note.hasPropertyWithName(name)) {
         throw new Error(`Property "${name}" already exists in this note`);
      }

      // Buscar propiedad global existente
      const existingGlobal = this.findGlobalByName(globalProperties, name);

      let globalProperty: GlobalProperty;
      let wasLinked = false;

      if (existingGlobal) {
         globalProperty = existingGlobal;
         wasLinked = true;
      } else {
         globalProperty = GlobalProperty.create({ name, type });
      }

      // Crear propiedad de nota
      const noteProperty = NoteProperty.create({
         name,
         type,
         noteId: note.id,
         value: value ?? NoteProperty.getDefaultValueForType(type),
         globalPropertyId: globalProperty.id,
      });

      // Vincular
      globalProperty.addLink(note.id, noteProperty.id);
      note.addProperty(noteProperty);

      return { noteProperty, globalProperty, wasLinked };
   }

   /**
    * Renombra una propiedad con lógica de vinculación
    */
   renameNoteProperty(
      note: Note,
      propertyId: string,
      newName: string,
      globalProperties: GlobalProperty[],
   ): {
      noteProperty: NoteProperty;
      newGlobalProperty?: GlobalProperty;
      oldGlobalProperty?: GlobalProperty;
   } {
      const noteProperty = note.getProperty(propertyId);
      if (!noteProperty) {
         throw new Error(`Property ${propertyId} not found`);
      }

      // Validar nombre duplicado
      if (note.hasPropertyWithName(newName, propertyId)) {
         throw new Error(`Property "${newName}" already exists in this note`);
      }

      const oldGlobalId = noteProperty.globalPropertyId;
      let oldGlobalProperty: GlobalProperty | undefined;
      let newGlobalProperty: GlobalProperty | undefined;

      // Desvincular de propiedad global anterior si existe
      if (oldGlobalId) {
         oldGlobalProperty = globalProperties.find(
            (gp) => gp.id === oldGlobalId,
         );
         if (oldGlobalProperty) {
            oldGlobalProperty.removeLink(note.id, propertyId);
         }
      }

      // Buscar o crear nueva propiedad global
      const existingGlobal = this.findGlobalByName(globalProperties, newName);
      if (existingGlobal) {
         newGlobalProperty = existingGlobal;
      } else {
         newGlobalProperty = GlobalProperty.create({
            name: newName,
            type: noteProperty.type,
         });
      }

      // Actualizar y vincular
      noteProperty.updateName(newName);
      noteProperty.linkToGlobal(newGlobalProperty.id);
      newGlobalProperty.addLink(note.id, propertyId);

      return { noteProperty, newGlobalProperty, oldGlobalProperty };
   }

   /**
    * Actualiza el valor de una propiedad
    */
   updateNotePropertyValue(
      noteProperty: NoteProperty,
      newValue: PropertyValue,
   ): void {
      noteProperty.updateValue(newValue);
   }

   /**
    * Cambia el tipo de una propiedad
    */
   changeNotePropertyType(
      noteProperty: NoteProperty,
      newType: PropertyType,
      globalProperties: GlobalProperty[],
   ): void {
      noteProperty.updateType(newType);

      // Actualizar propiedad global si está vinculada
      if (noteProperty.globalPropertyId) {
         const globalProperty = globalProperties.find(
            (gp) => gp.id === noteProperty.globalPropertyId,
         );
         if (globalProperty) {
            globalProperty.updateType(newType);
         }
      }
   }

   /**
    * Elimina una propiedad de una nota
    */
   deleteNoteProperty(
      note: Note,
      propertyId: string,
      globalProperties: GlobalProperty[],
   ): {
      removedProperty: NoteProperty;
      updatedGlobalProperty?: GlobalProperty;
   } {
      const noteProperty = note.getProperty(propertyId);
      if (!noteProperty) {
         throw new Error(`Property ${propertyId} not found`);
      }

      let updatedGlobalProperty: GlobalProperty | undefined;

      // Desvincular de propiedad global
      if (noteProperty.globalPropertyId) {
         const globalProperty = globalProperties.find(
            (gp) => gp.id === noteProperty.globalPropertyId,
         );
         if (globalProperty) {
            globalProperty.removeLink(note.id, propertyId);
            updatedGlobalProperty = globalProperty;
         }
      }

      // Remover de la nota
      note.removeProperty(propertyId);

      return { removedProperty: noteProperty, updatedGlobalProperty };
   }

   // ============================================================================
   // OPERACIONES CON PROPIEDADES GLOBALES
   // ============================================================================

   /**
    * Renombra una propiedad global y sincroniza todas las vinculadas
    */
   renameGlobalProperty(
      globalProperty: GlobalProperty,
      newName: string,
      notes: Note[],
      globalProperties: GlobalProperty[],
   ): { updatedNotes: Note[]; hasConflict: boolean } {
      // Verificar conflicto de nombres
      const existing = this.findGlobalByName(
         globalProperties.filter((gp) => gp.id !== globalProperty.id),
         newName,
      );

      if (existing) {
         return { updatedNotes: [], hasConflict: true };
      }

      // Actualizar nombre
      globalProperty.updateName(newName);

      // Sincronizar todas las propiedades vinculadas
      const updatedNotes: Note[] = [];
      for (const link of globalProperty.linkedProperties) {
         const note = notes.find((n) => n.id === link.noteId);
         if (note) {
            const noteProperty = note.getProperty(link.propertyId);
            if (noteProperty) {
               noteProperty.updateName(newName);
               if (!updatedNotes.includes(note)) {
                  updatedNotes.push(note);
               }
            }
         }
      }

      return { updatedNotes, hasConflict: false };
   }

   /**
    * Elimina una propiedad global si es posible
    */
   deleteGlobalProperty(globalProperty: GlobalProperty): boolean {
      return globalProperty.canBeDeleted();
   }

   // ============================================================================
   // UTILIDADES Y CONSULTAS
   // ============================================================================

   /**
    * Obtiene sugerencias de propiedades globales
    */
   getGlobalPropertySuggestions(
      globalProperties: GlobalProperty[],
      searchTerm: string,
      excludeNote?: Note,
   ): GlobalProperty[] {
      const normalizedTerm = normalizeText(searchTerm);

      return globalProperties.filter((gp) => {
         // Excluir las ya vinculadas a la nota
         if (excludeNote && gp.isLinkedToNote(excludeNote.id)) {
            return false;
         }

         // Filtrar por término de búsqueda
         if (normalizedTerm) {
            return normalizeText(gp.name).includes(normalizedTerm);
         }

         return true;
      });
   }

   /**
    * Verifica desajustes de tipo entre propiedades vinculadas
    */
   getTypeMismatches(
      globalProperty: GlobalProperty,
      notes: Note[],
   ): Array<{
      note: Note;
      property: NoteProperty;
      expectedType: PropertyType;
      actualType: PropertyType;
   }> {
      const mismatches: Array<{
         note: Note;
         property: NoteProperty;
         expectedType: PropertyType;
         actualType: PropertyType;
      }> = [];

      for (const link of globalProperty.linkedProperties) {
         const note = notes.find((n) => n.id === link.noteId);
         if (note) {
            const noteProperty = note.getProperty(link.propertyId);
            if (
               noteProperty &&
               !noteProperty.hasTypeMatch(globalProperty.type)
            ) {
               mismatches.push({
                  note,
                  property: noteProperty,
                  expectedType: globalProperty.type,
                  actualType: noteProperty.type,
               });
            }
         }
      }

      return mismatches;
   }

   /**
    * Estadísticas de una propiedad global
    */
   getGlobalPropertyStats(
      globalProperty: GlobalProperty,
      notes: Note[],
   ): {
      linkedCount: number;
      noteCount: number;
      typeMismatches: number;
   } {
      const noteIds = new Set<string>();
      let typeMismatches = 0;

      for (const link of globalProperty.linkedProperties) {
         noteIds.add(link.noteId);

         const note = notes.find((n) => n.id === link.noteId);
         if (note) {
            const noteProperty = note.getProperty(link.propertyId);
            if (
               noteProperty &&
               !noteProperty.hasTypeMatch(globalProperty.type)
            ) {
               typeMismatches++;
            }
         }
      }

      return {
         linkedCount: globalProperty.linkedProperties.length,
         noteCount: noteIds.size,
         typeMismatches,
      };
   }

   // ============================================================================
   // HELPERS PRIVADOS
   // ============================================================================

   private findGlobalByName(
      globalProperties: GlobalProperty[],
      name: string,
   ): GlobalProperty | undefined {
      const normalizedName = normalizeText(name);
      return globalProperties.find(
         (gp) => normalizeText(gp.name) === normalizedName,
      );
   }
}
