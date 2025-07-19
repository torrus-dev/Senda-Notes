import { Note } from "@domain/entities/Note";
import { NoteProperty } from "@domain/entities/NoteProperty";
import { GlobalProperty } from "@domain/entities/GlobalProperty";
import { normalizeText } from "@utils/searchUtils";

export interface PropertyValidationResult {
   isValid: boolean;
   errors: string[];
   warnings: string[];
}

export interface PropertyCreationResult {
   noteProperty: NoteProperty;
   globalProperty?: GlobalProperty;
   wasLinkedToExisting: boolean;
}

export interface PropertyRenameResult {
   renamedNoteProperty: NoteProperty;
   linkedGlobalProperty?: GlobalProperty;
   createdNewGlobalProperty?: GlobalProperty;
   unlinkedFromPreviousGlobal?: boolean;
}

/**
 * Servicio de dominio para la lógica compleja de propiedades
 * Maneja todas las operaciones relacionadas con NoteProperty y GlobalProperty
 *
 * Organización:
 * - NoteProperty Operations: Operaciones que inician desde una nota
 * - GlobalProperty Operations: Operaciones que inician desde propiedades globales
 * - Cross-Entity Operations: Operaciones que afectan ambos tipos
 * - Validation & Utilities: Validaciones y utilidades compartidas
 */
export class PropertyService {
   // ============================================================================
   // NOTEPROPERTY OPERATIONS - Operaciones iniciadas desde notas
   // ============================================================================

   /**
    * Valida si se puede crear una nueva propiedad en una nota
    */
   validatePropertyCreation(
      note: Note,
      propertyName: string,
      propertyType: string,
      excludePropertyId?: string,
   ): PropertyValidationResult {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar nombre no vacío
      if (!propertyName.trim()) {
         errors.push("El nombre de la propiedad no puede estar vacío");
      }

      // Validar nombres duplicados en la nota
      if (note.hasPropertyWithName(propertyName, excludePropertyId)) {
         errors.push(
            `Ya existe una propiedad con el nombre "${propertyName}" en esta nota`,
         );
      }

      // Validar tipo no vacío
      if (!propertyType.trim()) {
         errors.push("El tipo de la propiedad no puede estar vacío");
      }

      return {
         isValid: errors.length === 0,
         errors,
         warnings,
      };
   }

   /**
    * Crea una nueva propiedad en una nota y maneja la vinculación con propiedades globales
    */
   createNoteProperty(
      note: Note,
      propertyName: string,
      propertyType: string,
      existingGlobalProperties: GlobalProperty[],
      propertyValue?: any,
   ): PropertyCreationResult {
      // Validar la creación
      const validation = this.validatePropertyCreation(
         note,
         propertyName,
         propertyType,
      );
      if (!validation.isValid) {
         throw new Error(
            `Cannot create property: ${validation.errors.join(", ")}`,
         );
      }

      // Buscar propiedad global existente con el mismo nombre
      const existingGlobalProperty = this.findGlobalPropertyByName(
         existingGlobalProperties,
         propertyName,
      );

      // Crear la nueva propiedad de nota
      const noteProperty = NoteProperty.create({
         name: propertyName,
         type: propertyType,
         noteId: note.id,
         value: propertyValue,
         globalPropertyId: existingGlobalProperty?.id,
      });

      let wasLinkedToExisting = false;
      let globalProperty: GlobalProperty | undefined;

      if (existingGlobalProperty) {
         // Vincular a propiedad global existente
         this.linkNotePropertyToGlobal(noteProperty, existingGlobalProperty);
         globalProperty = existingGlobalProperty;
         wasLinkedToExisting = true;
      } else {
         // Crear nueva propiedad global
         globalProperty = GlobalProperty.create({
            name: propertyName,
            type: propertyType,
         });
         this.linkNotePropertyToGlobal(noteProperty, globalProperty);
      }

      // Añadir propiedad a la nota
      note.addProperty(noteProperty);

      return {
         noteProperty,
         globalProperty,
         wasLinkedToExisting,
      };
   }

   /**
    * Maneja el renombrado de una propiedad de nota con toda la lógica de vinculación
    */
   renameNoteProperty(
      note: Note,
      propertyId: string,
      newName: string,
      existingGlobalProperties: GlobalProperty[],
   ): PropertyRenameResult {
      const noteProperty = note.getProperty(propertyId);
      if (!noteProperty) {
         throw new Error(
            `Property with id ${propertyId} not found in note ${note.id}`,
         );
      }

      // Validar el nuevo nombre
      const validation = this.validatePropertyCreation(
         note,
         newName,
         noteProperty.type,
         propertyId,
      );
      if (!validation.isValid) {
         throw new Error(
            `Cannot rename property: ${validation.errors.join(", ")}`,
         );
      }

      const oldName = noteProperty.name;
      const oldGlobalPropertyId = noteProperty.globalPropertyId;

      // Actualizar el nombre de la propiedad
      noteProperty.updateName(newName);

      let linkedGlobalProperty: GlobalProperty | undefined;
      let createdNewGlobalProperty: GlobalProperty | undefined;
      let unlinkedFromPreviousGlobal = false;

      // Buscar si existe una propiedad global con el nuevo nombre
      const targetGlobalProperty = this.findGlobalPropertyByName(
         existingGlobalProperties,
         newName,
      );

      if (targetGlobalProperty) {
         // Existe propiedad global con el nuevo nombre
         if (
            oldGlobalPropertyId &&
            oldGlobalPropertyId !== targetGlobalProperty.id
         ) {
            // Desvincular de la propiedad global anterior
            const oldGlobalProperty = existingGlobalProperties.find(
               (gp) => gp.id === oldGlobalPropertyId,
            );
            if (oldGlobalProperty) {
               this.unlinkNotePropertyFromGlobal(
                  noteProperty,
                  oldGlobalProperty,
               );
               unlinkedFromPreviousGlobal = true;
            }
         }

         // Vincular a la propiedad global del nuevo nombre
         this.linkNotePropertyToGlobal(noteProperty, targetGlobalProperty);
         linkedGlobalProperty = targetGlobalProperty;
      } else {
         // No existe propiedad global con el nuevo nombre
         if (oldGlobalPropertyId) {
            // Desvincular de la propiedad global anterior
            const oldGlobalProperty = existingGlobalProperties.find(
               (gp) => gp.id === oldGlobalPropertyId,
            );
            if (oldGlobalProperty) {
               this.unlinkNotePropertyFromGlobal(
                  noteProperty,
                  oldGlobalProperty,
               );
               unlinkedFromPreviousGlobal = true;
            }
         }

         // Crear nueva propiedad global
         createdNewGlobalProperty = GlobalProperty.create({
            name: newName,
            type: noteProperty.type,
         });
         this.linkNotePropertyToGlobal(noteProperty, createdNewGlobalProperty);
         linkedGlobalProperty = createdNewGlobalProperty;
      }

      return {
         renamedNoteProperty: noteProperty,
         linkedGlobalProperty,
         createdNewGlobalProperty,
         unlinkedFromPreviousGlobal,
      };
   }

   /**
    * Cambia el tipo de una propiedad de nota y actualiza la propiedad global asociada
    */
   changeNotePropertyType(
      noteProperty: NoteProperty,
      newType: string,
      globalProperties: GlobalProperty[],
   ): { updatedGlobalProperty?: GlobalProperty } {
      const oldType = noteProperty.type;
      noteProperty.updateType(newType);

      // Si está vinculada a una propiedad global, actualizar su tipo también
      if (noteProperty.globalPropertyId) {
         const globalProperty = globalProperties.find(
            (gp) => gp.id === noteProperty.globalPropertyId,
         );
         if (globalProperty) {
            globalProperty.updateType(newType);
            return { updatedGlobalProperty: globalProperty };
         }
      }

      return {};
   }

   /**
    * Sincroniza una propiedad de nota con su propiedad global asociada
    */
   syncNotePropertyWithGlobal(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ): void {
      if (noteProperty.globalPropertyId !== globalProperty.id) {
         throw new Error(
            "NoteProperty is not linked to the provided GlobalProperty",
         );
      }

      noteProperty.syncWithGlobal(globalProperty.name, globalProperty.type);
   }

   /**
    * Maneja el renombrado de una propiedad global (método de conveniencia)
    * @deprecated Use updateGlobalProperty instead for more control
    */
   renameGlobalProperty(
      globalProperty: GlobalProperty,
      newName: string,
      notes: Note[],
      existingGlobalProperties: GlobalProperty[],
   ): {
      updatedNotes: Note[];
      conflictingGlobalProperty?: GlobalProperty;
   } {
      const result = this.updateGlobalProperty(
         globalProperty,
         { name: newName },
         notes,
         existingGlobalProperties,
      );

      return {
         updatedNotes: result.updatedNotes,
         conflictingGlobalProperty: result.conflictingProperty,
      };
   }

   /**
    * Verifica si hay desajustes de tipo entre propiedades vinculadas
    */
   checkTypeMismatches(
      globalProperty: GlobalProperty,
      notes: Note[],
   ): Array<{
      note: Note;
      property: NoteProperty;
      expectedType: string;
      actualType: string;
   }> {
      const mismatches: Array<{
         note: Note;
         property: NoteProperty;
         expectedType: string;
         actualType: string;
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

   // ============================================================================
   // VALIDATION & UTILITIES - Validaciones y utilidades compartidas
   // ============================================================================

   /**
    * Obtiene sugerencias de propiedades globales para una nota
    */
   getGlobalPropertySuggestions(
      globalProperties: GlobalProperty[],
      searchTerm: string,
      note?: Note,
   ): GlobalProperty[] {
      const normalizedSearchTerm = searchTerm.trim()
         ? normalizeText(searchTerm)
         : "";

      return globalProperties.filter((globalProperty) => {
         // Si hay nota, excluir propiedades ya vinculadas a esta nota
         if (note && globalProperty.isLinkedToNote(note.id)) {
            return false;
         }

         // Si no hay término de búsqueda, incluir todas las demás
         if (!normalizedSearchTerm) {
            return true;
         }

         // Filtrar por nombre
         return normalizeText(globalProperty.name).includes(
            normalizedSearchTerm,
         );
      });
   }

   // ============================================================================
   // CROSS-ENTITY OPERATIONS - Operaciones que afectan ambos tipos
   // ============================================================================

   /**
    * Elimina una propiedad de nota y maneja la desvinculación
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
         throw new Error(
            `Property with id ${propertyId} not found in note ${note.id}`,
         );
      }

      let updatedGlobalProperty: GlobalProperty | undefined;

      // Si está vinculada a una propiedad global, desvincular
      if (noteProperty.globalPropertyId) {
         const globalProperty = globalProperties.find(
            (gp) => gp.id === noteProperty.globalPropertyId,
         );
         if (globalProperty) {
            this.unlinkNotePropertyFromGlobal(noteProperty, globalProperty);
            updatedGlobalProperty = globalProperty;
         }
      }

      // Remover de la nota
      note.removeProperty(propertyId);

      return {
         removedProperty: noteProperty,
         updatedGlobalProperty,
      };
   }

   // ============================================================================
   // PRIVATE HELPERS - Métodos de apoyo internos
   // ============================================================================

   /**
    * Vincula una propiedad de nota a una propiedad global
    */
   private linkNotePropertyToGlobal(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ): void {
      // Actualizar la propiedad de nota
      noteProperty.linkToGlobal(globalProperty.id);
      noteProperty.updateName(globalProperty.name);

      // Actualizar la propiedad global
      globalProperty.addLink(noteProperty.noteId, noteProperty.id);
   }

   /**
    * Desvincula una propiedad de nota de una propiedad global
    */
   private unlinkNotePropertyFromGlobal(
      noteProperty: NoteProperty,
      globalProperty: GlobalProperty,
   ): void {
      // Actualizar la propiedad global
      globalProperty.removeLink(noteProperty.noteId, noteProperty.id);

      // Actualizar la propiedad de nota
      noteProperty.unlinkFromGlobal();
   }

   /**
    * Busca una propiedad global por nombre (normalizado)
    */
   private findGlobalPropertyByName(
      globalProperties: GlobalProperty[],
      name: string,
   ): GlobalProperty | undefined {
      const normalizedName = normalizeText(name.trim());
      return globalProperties.find(
         (gp) => normalizeText(gp.name) === normalizedName,
      );
   }

   // ============================================================================
   // GLOBALPROPERTY OPERATIONS - Operaciones iniciadas desde propiedades globales
   // ============================================================================

   /**
    * Crea una nueva propiedad global independiente
    */
   createGlobalProperty(
      name: string,
      type: string,
      existingGlobalProperties: GlobalProperty[],
   ): GlobalProperty {
      // Validar que no exista ya una con el mismo nombre
      const existingProperty = this.findGlobalPropertyByName(
         existingGlobalProperties,
         name,
      );
      if (existingProperty) {
         throw new Error(`Global property with name "${name}" already exists`);
      }

      // Validar parámetros básicos
      if (!name.trim()) {
         throw new Error("Global property name cannot be empty");
      }
      if (!type.trim()) {
         throw new Error("Global property type cannot be empty");
      }

      return GlobalProperty.create({ name: name.trim(), type: type.trim() });
   }

   /**
    * Actualiza una propiedad global y sincroniza propiedades vinculadas si es necesario
    */
   updateGlobalProperty(
      globalProperty: GlobalProperty,
      updates: { name?: string; type?: string },
      notes: Note[],
      existingGlobalProperties: GlobalProperty[],
   ): {
      updatedGlobalProperty: GlobalProperty;
      updatedNotes: Note[];
      hasNameConflict?: boolean;
      conflictingProperty?: GlobalProperty;
   } {
      const updatedNotes: Note[] = [];
      let hasNameConflict = false;
      let conflictingProperty: GlobalProperty | undefined;

      // Si se está cambiando el nombre, verificar conflictos
      if (updates.name && updates.name !== globalProperty.name) {
         const existing = this.findGlobalPropertyByName(
            existingGlobalProperties.filter(
               (gp) => gp.id !== globalProperty.id,
            ),
            updates.name,
         );

         if (existing) {
            return {
               updatedGlobalProperty: globalProperty,
               updatedNotes: [],
               hasNameConflict: true,
               conflictingProperty: existing,
            };
         }

         // Actualizar nombre en la propiedad global
         globalProperty.updateName(updates.name);

         // Sincronizar todas las propiedades de nota vinculadas
         for (const link of globalProperty.linkedProperties) {
            const note = notes.find((n) => n.id === link.noteId);
            if (note) {
               const noteProperty = note.getProperty(link.propertyId);
               if (noteProperty) {
                  noteProperty.updateName(updates.name);
                  if (!updatedNotes.includes(note)) {
                     updatedNotes.push(note);
                  }
               }
            }
         }
      }

      // Si se está cambiando el tipo
      if (updates.type && updates.type !== globalProperty.type) {
         globalProperty.updateType(updates.type);
         // Nota: No forzamos el cambio de tipo en las NoteProperty
         // Se mostrará como advertencia en la UI
      }

      return {
         updatedGlobalProperty: globalProperty,
         updatedNotes,
         hasNameConflict,
         conflictingProperty,
      };
   }

   /**
    * Elimina una propiedad global si no tiene vínculos
    */
   deleteGlobalProperty(globalProperty: GlobalProperty): boolean {
      if (!globalProperty.canBeDeleted()) {
         return false; // No se puede eliminar porque tiene vínculos
      }
      return true; // El repositorio puede proceder con la eliminación
   }

   /**
    * Combina dos propiedades globales (útil para resolver conflictos de nombres)
    */
   mergeGlobalProperties(
      sourceGlobalProperty: GlobalProperty,
      targetGlobalProperty: GlobalProperty,
      notes: Note[],
   ): {
      mergedGlobalProperty: GlobalProperty;
      updatedNotes: Note[];
      removedGlobalPropertyId: string;
   } {
      const updatedNotes: Note[] = [];

      // Transferir todos los vínculos de source a target
      for (const link of sourceGlobalProperty.linkedProperties) {
         // Añadir vínculo al target
         targetGlobalProperty.addLink(link.noteId, link.propertyId);

         // Actualizar la NoteProperty para que apunte al target
         const note = notes.find((n) => n.id === link.noteId);
         if (note) {
            const noteProperty = note.getProperty(link.propertyId);
            if (noteProperty) {
               noteProperty.linkToGlobal(targetGlobalProperty.id);
               noteProperty.updateName(targetGlobalProperty.name);
               // Actualizar tipo si es diferente (opcional, podría mostrar advertencia)
               if (!updatedNotes.includes(note)) {
                  updatedNotes.push(note);
               }
            }
         }
      }

      // Si el tipo del target está vacío o es genérico, usar el del source
      if (!targetGlobalProperty.type || targetGlobalProperty.type === "text") {
         targetGlobalProperty.updateType(sourceGlobalProperty.type);
      }

      return {
         mergedGlobalProperty: targetGlobalProperty,
         updatedNotes,
         removedGlobalPropertyId: sourceGlobalProperty.id,
      };
   }

   /**
    * Obtiene estadísticas de uso de una propiedad global
    */
   getGlobalPropertyStats(
      globalProperty: GlobalProperty,
      notes: Note[],
   ): {
      linkedCount: number;
      noteCount: number;
      typeMismatches: number;
      usageByType: Record<string, number>;
   } {
      const noteIds = new Set<string>();
      const usageByType: Record<string, number> = {};
      let typeMismatches = 0;

      for (const link of globalProperty.linkedProperties) {
         noteIds.add(link.noteId);

         const note = notes.find((n) => n.id === link.noteId);
         if (note) {
            const noteProperty = note.getProperty(link.propertyId);
            if (noteProperty) {
               // Contar por tipo
               const propertyType = noteProperty.type;
               usageByType[propertyType] = (usageByType[propertyType] || 0) + 1;

               // Contar desajustes de tipo
               if (!noteProperty.hasTypeMatch(globalProperty.type)) {
                  typeMismatches++;
               }
            }
         }
      }

      return {
         linkedCount: globalProperty.linkedProperties.length,
         noteCount: noteIds.size,
         typeMismatches,
         usageByType,
      };
   }

   /**
    * Valida la integridad de las vinculaciones entre propiedades
    */
   validatePropertyIntegrity(
      notes: Note[],
      globalProperties: GlobalProperty[],
   ): Array<{
      type: string;
      message: string;
      noteId?: string;
      propertyId?: string;
      globalPropertyId?: string;
   }> {
      const issues: Array<{
         type: string;
         message: string;
         noteId?: string;
         propertyId?: string;
         globalPropertyId?: string;
      }> = [];

      // Verificar que todas las vinculaciones sean bidireccionales
      for (const note of notes) {
         for (const noteProperty of note.properties) {
            if (noteProperty.globalPropertyId) {
               const globalProperty = globalProperties.find(
                  (gp) => gp.id === noteProperty.globalPropertyId,
               );

               if (!globalProperty) {
                  issues.push({
                     type: "missing_global_property",
                     message: `NoteProperty ${noteProperty.id} references non-existent GlobalProperty ${noteProperty.globalPropertyId}`,
                     noteId: note.id,
                     propertyId: noteProperty.id,
                     globalPropertyId: noteProperty.globalPropertyId,
                  });
               } else if (
                  !globalProperty.isLinkedTo(note.id, noteProperty.id)
               ) {
                  issues.push({
                     type: "unidirectional_link",
                     message: `NoteProperty ${noteProperty.id} links to GlobalProperty ${globalProperty.id} but not vice versa`,
                     noteId: note.id,
                     propertyId: noteProperty.id,
                     globalPropertyId: globalProperty.id,
                  });
               }
            }
         }
      }

      // Verificar que todos los enlaces en propiedades globales tengan propiedades correspondientes
      for (const globalProperty of globalProperties) {
         for (const link of globalProperty.linkedProperties) {
            const note = notes.find((n) => n.id === link.noteId);
            if (!note) {
               issues.push({
                  type: "missing_note",
                  message: `GlobalProperty ${globalProperty.id} links to non-existent note ${link.noteId}`,
                  globalPropertyId: globalProperty.id,
                  noteId: link.noteId,
               });
            } else {
               const noteProperty = note.getProperty(link.propertyId);
               if (!noteProperty) {
                  issues.push({
                     type: "missing_note_property",
                     message: `GlobalProperty ${globalProperty.id} links to non-existent NoteProperty ${link.propertyId}`,
                     globalPropertyId: globalProperty.id,
                     noteId: link.noteId,
                     propertyId: link.propertyId,
                  });
               } else if (noteProperty.globalPropertyId !== globalProperty.id) {
                  issues.push({
                     type: "mismatched_link",
                     message: `GlobalProperty ${globalProperty.id} links to NoteProperty ${noteProperty.id} but property links to ${noteProperty.globalPropertyId}`,
                     globalPropertyId: globalProperty.id,
                     noteId: link.noteId,
                     propertyId: link.propertyId,
                  });
               }
            }
         }
      }

      return issues;
   }
}
