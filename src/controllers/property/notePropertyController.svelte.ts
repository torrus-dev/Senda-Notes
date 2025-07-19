import type { NoteProperty } from "@domain/entities/NoteProperty";
import type { Note } from "@domain/entities/Note";
import { PropertyUseCases } from "@application/usecases/PropertyUseCases";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";

interface ControllerState {
   isLoading: boolean;
   lastError: string | null;
   lastSuccess: string | null;
}

/**
 * Controlador ligero para propiedades de nota
 * Delega toda la lógica compleja a PropertyUseCases
 * Mantiene solo estado reactivo y métodos de conveniencia para la UI
 */
class NotePropertyController {
   private state = $state<ControllerState>({
      isLoading: false,
      lastError: null,
      lastSuccess: null,
   });

   private get propertyUseCases(): PropertyUseCases {
      return startupManager.getService("propertyUseCases");
   }

   private get noteQueryRepository() {
      return startupManager.getService("noteQueryRepository");
   }

   // ============================================================================
   // STATE ACCESSORS - Acceso al estado reactivo
   // ============================================================================

   get isLoading(): boolean {
      return this.state.isLoading;
   }

   get lastError(): string | null {
      return this.state.lastError;
   }

   get lastSuccess(): string | null {
      return this.state.lastSuccess;
   }

   /**
    * Limpia mensajes de error y éxito
    */
   clearMessages(): void {
      this.state.lastError = null;
      this.state.lastSuccess = null;
   }

   // ============================================================================
   // NOTE PROPERTY OPERATIONS - Operaciones de propiedades de nota
   // ============================================================================

   /**
    * Crea una nueva propiedad en una nota
    */
   async handleCreateNoteProperty(
      noteId: string,
      name: string,
      type: string,
      value?: any,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.createPropertyWithLinking(
            noteId,
            name,
            type,
            value,
         );

         if (result.success) {
            this.state.lastSuccess = result.wasLinkedToExisting
               ? `Propiedad "${name}" creada y vinculada a propiedad global existente`
               : `Propiedad "${name}" creada con nueva propiedad global`;
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al crear la propiedad";
            return false;
         }
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Renombra una propiedad de nota
    */
   async handleNotePropertyRename(
      noteId: string,
      propertyId: string,
      newName: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.renameWithCascade(
            noteId,
            propertyId,
            newName,
         );

         if (result.success) {
            let message = `Propiedad renombrada a "${newName}"`;
            if (result.createdNewGlobalProperty) {
               message += " y nueva propiedad global creada";
            } else if (result.unlinkedFromPreviousGlobal) {
               message += " y vinculada a propiedad global existente";
            }
            this.state.lastSuccess = message;
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al renombrar";
            return false;
         }
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Elimina una propiedad de nota
    */
   async deletePropertyFromNote(
      noteId: string,
      propertyId: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.deleteWithSync(
            noteId,
            propertyId,
         );

         if (result.success) {
            this.state.lastSuccess = "Propiedad eliminada correctamente";
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al eliminar";
            return false;
         }
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Cambia el tipo de una propiedad de nota
    */
   async changeNotePropertyType(
      noteId: string,
      propertyId: string,
      newType: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.changeNotePropertyType(
            noteId,
            propertyId,
            newType,
         );

         if (result.success) {
            this.state.lastSuccess = `Tipo cambiado a "${newType}"`;
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al cambiar tipo";
            return false;
         }
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Reordena las propiedades de una nota
    */
   async reorderNoteProperties(
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.reorderNoteProperties(
            noteId,
            propertyId,
            newPosition,
         );

         if (result.success) {
            // No mostrar mensaje de éxito para reordenamientos (operación silenciosa)
            return true;
         } else {
            this.state.lastError =
               result.error || "Error al reordenar propiedades";
            return false;
         }
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Actualiza el valor de una propiedad de nota
    */
   async updateNotePropertyValue(
      noteId: string,
      propertyId: string,
      newValue: any,
   ): Promise<boolean> {
      try {
         const result = await this.propertyUseCases.updateNotePropertyValue(
            noteId,
            propertyId,
            newValue,
         );

         if (!result.success) {
            this.state.lastError = result.error || "Error al actualizar valor";
         }

         return result.success;
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return false;
      }
   }

   // ============================================================================
   // QUERY METHODS - Métodos de consulta (sin estado de carga)
   // ============================================================================

   /**
    * Obtiene las propiedades de una nota
    */
   getNoteProperties(noteId: string): NoteProperty[] {
      const note = this.noteQueryRepository.findById(noteId);
      return note ? note.properties : [];
   }

   /**
    * Obtiene una propiedad específica por ID
    */
   getPropertyById(
      noteId: string,
      propertyId: string,
   ): NoteProperty | undefined {
      const note = this.noteQueryRepository.findById(noteId);
      return note?.getProperty(propertyId);
   }

   /**
    * Verifica si ya existe una propiedad con el mismo nombre
    */
   isDuplicateName(
      noteId: string,
      name: string,
      excludePropertyId?: string,
   ): boolean {
      const note = this.noteQueryRepository.findById(noteId);
      return note ? note.hasPropertyWithName(name, excludePropertyId) : false;
   }

   /**
    * Obtiene sugerencias de propiedades globales
    */
   getGlobalPropertySuggestions(searchTerm: string, noteId: string) {
      return this.propertyUseCases.getGlobalPropertySuggestions(
         searchTerm,
         noteId,
      );
   }

   // ============================================================================
   // VALIDATION HELPERS - Métodos de ayuda para validación en UI
   // ============================================================================

   /**
    * Valida si se puede crear una propiedad (para feedback en tiempo real)
    */
   canCreateProperty(
      noteId: string,
      name: string,
      type: string,
   ): {
      valid: boolean;
      errors: string[];
   } {
      const errors: string[] = [];

      if (!name.trim()) {
         errors.push("El nombre no puede estar vacío");
      }

      if (!type.trim()) {
         errors.push("El tipo no puede estar vacío");
      }

      if (this.isDuplicateName(noteId, name)) {
         errors.push("Ya existe una propiedad con este nombre");
      }

      return {
         valid: errors.length === 0,
         errors,
      };
   }

   /**
    * Valida si se puede renombrar una propiedad
    */
   canRenameProperty(
      noteId: string,
      propertyId: string,
      newName: string,
   ): {
      valid: boolean;
      errors: string[];
   } {
      const errors: string[] = [];

      if (!newName.trim()) {
         errors.push("El nombre no puede estar vacío");
      }

      if (this.isDuplicateName(noteId, newName, propertyId)) {
         errors.push("Ya existe una propiedad con este nombre");
      }

      return {
         valid: errors.length === 0,
         errors,
      };
   }

   // ============================================================================
   // UTILITY METHODS - Métodos de utilidad
   // ============================================================================

   /**
    * Obtiene estadísticas de propiedades de una nota
    */
   getNotePropertyStats(noteId: string): {
      total: number;
      linked: number;
      unlinked: number;
      byType: Record<string, number>;
   } {
      const properties = this.getNoteProperties(noteId);
      const byType: Record<string, number> = {};
      let linked = 0;

      for (const property of properties) {
         byType[property.type] = (byType[property.type] || 0) + 1;
         if (property.isLinkedToGlobal()) {
            linked++;
         }
      }

      return {
         total: properties.length,
         linked,
         unlinked: properties.length - linked,
         byType,
      };
   }

   /**
    * Comprueba si una propiedad tiene desajuste de tipo con su propiedad global
    */
   hasTypeMismatch(noteId: string, propertyId: string): boolean {
      const property = this.getPropertyById(noteId, propertyId);
      if (!property || !property.isLinkedToGlobal()) {
         return false;
      }

      // Delegar al caso de uso para obtener la propiedad global y comparar
      const globalProperties =
         this.propertyUseCases.getGlobalPropertySuggestions("", undefined);
      const globalProperty = globalProperties.find(
         (gp) => gp.id === property.globalPropertyId,
      );

      return globalProperty
         ? !property.hasTypeMatch(globalProperty.type)
         : false;
   }
}

export const notePropertyController = $state(new NotePropertyController());
