import { PropertyService } from "@domain/services/PropertyService";
import { GlobalPropertyRepository } from "@infrastructure/repositories/core/GlobalPropertyRepository";
import { NoteRepository } from "@infrastructure/repositories/core/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/repositories/NoteQueryRepository";
import { Note } from "@domain/entities/Note";
import { NoteProperty } from "@domain/entities/NoteProperty";
import { GlobalProperty } from "@domain/entities/GlobalProperty";

export interface CreatePropertyResult {
   success: boolean;
   noteProperty?: NoteProperty;
   globalProperty?: GlobalProperty;
   wasLinkedToExisting: boolean;
   error?: string;
}

export interface RenamePropertyResult {
   success: boolean;
   renamedNoteProperty?: NoteProperty;
   linkedGlobalProperty?: GlobalProperty;
   createdNewGlobalProperty?: GlobalProperty;
   unlinkedFromPreviousGlobal?: boolean;
   updatedNotes?: Note[];
   error?: string;
}

export interface DeletePropertyResult {
   success: boolean;
   removedProperty?: NoteProperty;
   updatedGlobalProperty?: GlobalProperty;
   updatedNote?: Note;
   error?: string;
}

export interface IntegrityValidationResult {
   isValid: boolean;
   issues: Array<{
      type: string;
      message: string;
      noteId?: string;
      propertyId?: string;
      globalPropertyId?: string;
   }>;
   autoFixedIssues?: number;
}

export interface GlobalPropertyOperationResult {
   success: boolean;
   globalProperty?: GlobalProperty;
   updatedNotes?: Note[];
   conflictingProperty?: GlobalProperty;
   error?: string;
}

/**
 * Casos de uso para el sistema de propiedades
 * Orquesta operaciones complejas usando PropertyService + repositorios
 */
export class PropertyUseCases {
   constructor(
      private propertyService: PropertyService,
      private globalPropertyRepository: GlobalPropertyRepository,
      private noteRepository: NoteRepository,
      private noteQueryRepository: NoteQueryRepository,
   ) {}

   // ============================================================================
   // NOTE PROPERTY OPERATIONS - Operaciones de propiedades de nota
   // ============================================================================

   /**
    * Crea una nueva propiedad en una nota con vinculación automática
    */
   async createPropertyWithLinking(
      noteId: string,
      propertyName: string,
      propertyType: string,
      propertyValue?: any,
   ): Promise<CreatePropertyResult> {
      try {
         // Obtener la nota
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
               wasLinkedToExisting: false,
            };
         }

         // Obtener todas las propiedades globales
         const existingGlobalProperties =
            this.globalPropertyRepository.findAll();

         // Usar el servicio para crear la propiedad con toda la lógica
         const result = this.propertyService.createNoteProperty(
            note,
            propertyName,
            propertyType,
            existingGlobalProperties,
            propertyValue,
         );

         // Persistir los cambios
         this.noteRepository.update(noteId, note);

         // Si se creó una nueva propiedad global, persistirla
         if (!result.wasLinkedToExisting && result.globalProperty) {
            this.globalPropertyRepository.create(result.globalProperty);
         } else if (result.wasLinkedToExisting && result.globalProperty) {
            // Actualizar la propiedad global existente (se agregó un nuevo vínculo)
            this.globalPropertyRepository.update(
               result.globalProperty.id,
               result.globalProperty,
            );
         }

         return {
            success: true,
            noteProperty: result.noteProperty,
            globalProperty: result.globalProperty,
            wasLinkedToExisting: result.wasLinkedToExisting,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            wasLinkedToExisting: false,
         };
      }
   }

   /**
    * Renombra una propiedad de nota con cascada a propiedades globales
    */
   async renameWithCascade(
      noteId: string,
      propertyId: string,
      newName: string,
   ): Promise<RenamePropertyResult> {
      try {
         // Obtener la nota
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
            };
         }

         // Obtener todas las propiedades globales
         const existingGlobalProperties =
            this.globalPropertyRepository.findAll();

         // Usar el servicio para renombrar con toda la lógica
         const result = this.propertyService.renameNoteProperty(
            note,
            propertyId,
            newName,
            existingGlobalProperties,
         );

         // Persistir cambios en la nota
         this.noteRepository.update(noteId, note);

         // Persistir cambios en propiedades globales
         if (result.createdNewGlobalProperty) {
            this.globalPropertyRepository.create(
               result.createdNewGlobalProperty,
            );
         }

         if (result.linkedGlobalProperty) {
            this.globalPropertyRepository.update(
               result.linkedGlobalProperty.id,
               result.linkedGlobalProperty,
            );
         }

         return {
            success: true,
            renamedNoteProperty: result.renamedNoteProperty,
            linkedGlobalProperty: result.linkedGlobalProperty,
            createdNewGlobalProperty: result.createdNewGlobalProperty,
            unlinkedFromPreviousGlobal: result.unlinkedFromPreviousGlobal,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Elimina una propiedad de nota con sincronización de propiedades globales
    */
   async deleteWithSync(
      noteId: string,
      propertyId: string,
   ): Promise<DeletePropertyResult> {
      try {
         // Obtener la nota
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
            };
         }

         // Obtener todas las propiedades globales
         const existingGlobalProperties =
            this.globalPropertyRepository.findAll();

         // Usar el servicio para eliminar con toda la lógica
         const result = this.propertyService.deleteNoteProperty(
            note,
            propertyId,
            existingGlobalProperties,
         );

         // Persistir cambios en la nota
         this.noteRepository.update(noteId, note);

         // Persistir cambios en la propiedad global si fue actualizada
         if (result.updatedGlobalProperty) {
            this.globalPropertyRepository.update(
               result.updatedGlobalProperty.id,
               result.updatedGlobalProperty,
            );
         }

         return {
            success: true,
            removedProperty: result.removedProperty,
            updatedGlobalProperty: result.updatedGlobalProperty,
            updatedNote: note,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Cambia el tipo de una propiedad de nota
    */
   async changeNotePropertyType(
      noteId: string,
      propertyId: string,
      newType: string,
   ): Promise<{ success: boolean; error?: string }> {
      try {
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
            };
         }

         const noteProperty = note.getProperty(propertyId);
         if (!noteProperty) {
            return {
               success: false,
               error: `Property with id ${propertyId} not found`,
            };
         }

         const globalProperties = this.globalPropertyRepository.findAll();
         const result = this.propertyService.changeNotePropertyType(
            noteProperty,
            newType,
            globalProperties,
         );

         // Persistir cambios
         this.noteRepository.update(noteId, note);
         if (result.updatedGlobalProperty) {
            this.globalPropertyRepository.update(
               result.updatedGlobalProperty.id,
               result.updatedGlobalProperty,
            );
         }

         return { success: true };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Reordena las propiedades de una nota
    */
   async reorderNoteProperties(
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): Promise<{ success: boolean; error?: string }> {
      try {
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
            };
         }

         note.reorderProperties(propertyId, newPosition);
         this.noteRepository.update(noteId, note);

         return { success: true };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Actualiza el valor de una propiedad de nota
    */
   async updateNotePropertyValue(
      noteId: string,
      propertyId: string,
      newValue: any,
   ): Promise<{ success: boolean; error?: string }> {
      try {
         const note = this.noteQueryRepository.findById(noteId);
         if (!note) {
            return {
               success: false,
               error: `Note with id ${noteId} not found`,
            };
         }

         note.updateProperty(propertyId, (property) => {
            property.updateValue(newValue);
         });

         this.noteRepository.update(noteId, note);
         return { success: true };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   // ============================================================================
   // GLOBAL PROPERTY OPERATIONS - Operaciones de propiedades globales
   // ============================================================================

   /**
    * Crea una nueva propiedad global independiente
    */
   async createGlobalProperty(
      name: string,
      type: string,
   ): Promise<GlobalPropertyOperationResult> {
      try {
         const existingGlobalProperties =
            this.globalPropertyRepository.findAll();
         const newGlobalProperty = this.propertyService.createGlobalProperty(
            name,
            type,
            existingGlobalProperties,
         );

         this.globalPropertyRepository.create(newGlobalProperty);

         return {
            success: true,
            globalProperty: newGlobalProperty,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Actualiza una propiedad global y sincroniza todas las propiedades vinculadas
    */
   async updateGlobalProperty(
      globalPropertyId: string,
      updates: { name?: string; type?: string },
   ): Promise<GlobalPropertyOperationResult> {
      try {
         const globalProperty =
            this.globalPropertyRepository.findById(globalPropertyId);
         if (!globalProperty) {
            return {
               success: false,
               error: `Global property with id ${globalPropertyId} not found`,
            };
         }

         const allNotes = this.noteQueryRepository.findAll();
         const existingGlobalProperties =
            this.globalPropertyRepository.findAll();

         const result = this.propertyService.updateGlobalProperty(
            globalProperty,
            updates,
            allNotes,
            existingGlobalProperties,
         );

         if (result.hasNameConflict) {
            return {
               success: false,
               error: `Name conflict with existing global property`,
               conflictingProperty: result.conflictingProperty,
            };
         }

         // Persistir cambios
         this.globalPropertyRepository.update(
            globalPropertyId,
            result.updatedGlobalProperty,
         );

         // Actualizar notas modificadas
         for (const note of result.updatedNotes) {
            this.noteRepository.update(note.id, note);
         }

         return {
            success: true,
            globalProperty: result.updatedGlobalProperty,
            updatedNotes: result.updatedNotes,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Elimina una propiedad global si no tiene vínculos
    */
   async deleteGlobalProperty(
      globalPropertyId: string,
   ): Promise<{ success: boolean; error?: string }> {
      try {
         const globalProperty =
            this.globalPropertyRepository.findById(globalPropertyId);
         if (!globalProperty) {
            return {
               success: false,
               error: `Global property with id ${globalPropertyId} not found`,
            };
         }

         const canDelete =
            this.propertyService.deleteGlobalProperty(globalProperty);
         if (!canDelete) {
            return {
               success: false,
               error: "Cannot delete global property that has linked properties",
            };
         }

         this.globalPropertyRepository.delete(globalPropertyId);
         return { success: true };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   /**
    * Combina dos propiedades globales (útil para resolver conflictos)
    */
   async mergeGlobalProperties(
      sourceGlobalPropertyId: string,
      targetGlobalPropertyId: string,
   ): Promise<GlobalPropertyOperationResult> {
      try {
         const sourceGlobalProperty = this.globalPropertyRepository.findById(
            sourceGlobalPropertyId,
         );
         const targetGlobalProperty = this.globalPropertyRepository.findById(
            targetGlobalPropertyId,
         );

         if (!sourceGlobalProperty || !targetGlobalProperty) {
            return {
               success: false,
               error: "One or both global properties not found",
            };
         }

         const allNotes = this.noteQueryRepository.findAll();
         const result = this.propertyService.mergeGlobalProperties(
            sourceGlobalProperty,
            targetGlobalProperty,
            allNotes,
         );

         // Persistir cambios
         this.globalPropertyRepository.update(
            targetGlobalPropertyId,
            result.mergedGlobalProperty,
         );
         this.globalPropertyRepository.delete(result.removedGlobalPropertyId);

         // Actualizar notas modificadas
         for (const note of result.updatedNotes) {
            this.noteRepository.update(note.id, note);
         }

         return {
            success: true,
            globalProperty: result.mergedGlobalProperty,
            updatedNotes: result.updatedNotes,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
         };
      }
   }

   // ============================================================================
   // UTILITY OPERATIONS - Operaciones de utilidad
   // ============================================================================

   /**
    * Valida la integridad de todo el sistema de propiedades
    */
   async validateIntegrity(
      autoFix: boolean = false,
   ): Promise<IntegrityValidationResult> {
      try {
         const allNotes = this.noteQueryRepository.findAll();
         const allGlobalProperties = this.globalPropertyRepository.findAll();

         const issues = this.propertyService.validatePropertyIntegrity(
            allNotes,
            allGlobalProperties,
         );

         let autoFixedIssues = 0;

         if (autoFix && issues.length > 0) {
            // Implementar lógica de auto-reparación básica
            for (const issue of issues) {
               switch (issue.type) {
                  case "missing_global_property":
                     // Eliminar referencia a propiedad global inexistente
                     if (issue.noteId && issue.propertyId) {
                        const note = allNotes.find(
                           (n) => n.id === issue.noteId,
                        );
                        if (note) {
                           note.updateProperty(issue.propertyId, (prop) => {
                              prop.unlinkFromGlobal();
                           });
                           this.noteRepository.update(note.id, note);
                           autoFixedIssues++;
                        }
                     }
                     break;

                  case "missing_note":
                  case "missing_note_property":
                     // Eliminar vínculos a notas/propiedades inexistentes
                     if (
                        issue.globalPropertyId &&
                        issue.noteId &&
                        issue.propertyId
                     ) {
                        const globalProperty = allGlobalProperties.find(
                           (gp) => gp.id === issue.globalPropertyId,
                        );
                        if (globalProperty) {
                           globalProperty.removeLink(
                              issue.noteId,
                              issue.propertyId,
                           );
                           this.globalPropertyRepository.update(
                              globalProperty.id,
                              globalProperty,
                           );
                           autoFixedIssues++;
                        }
                     }
                     break;
               }
            }
         }

         return {
            isValid: issues.length === 0,
            issues,
            autoFixedIssues: autoFix ? autoFixedIssues : undefined,
         };
      } catch (error) {
         return {
            isValid: false,
            issues: [
               {
                  type: "validation_error",
                  message:
                     error instanceof Error
                        ? error.message
                        : "Unknown validation error",
               },
            ],
         };
      }
   }

   /**
    * Obtiene sugerencias de propiedades globales para una nota
    */
   getGlobalPropertySuggestions(
      searchTerm: string,
      noteId?: string,
   ): GlobalProperty[] {
      const allGlobalProperties = this.globalPropertyRepository.findAll();
      const note = noteId
         ? this.noteQueryRepository.findById(noteId)
         : undefined;

      return this.propertyService.getGlobalPropertySuggestions(
         allGlobalProperties,
         searchTerm,
         note,
      );
   }

   /**
    * Obtiene estadísticas del sistema de propiedades
    */
   getPropertySystemStats(): {
      globalProperties: {
         total: number;
         withLinks: number;
         orphaned: number;
         byType: Record<string, number>;
      };
      notes: {
         totalWithProperties: number;
         totalProperties: number;
         averagePropertiesPerNote: number;
      };
   } {
      const globalStats = this.globalPropertyRepository.getStats();
      const allNotes = this.noteQueryRepository.findAll();

      const notesWithProperties = allNotes.filter((note) =>
         note.hasProperties(),
      );
      const totalProperties = allNotes.reduce(
         (sum, note) => sum + note.getPropertyCount(),
         0,
      );

      return {
         globalProperties: globalStats,
         notes: {
            totalWithProperties: notesWithProperties.length,
            totalProperties,
            averagePropertiesPerNote:
               allNotes.length > 0 ? totalProperties / allNotes.length : 0,
         },
      };
   }
}
