import type { GlobalProperty } from "@domain/entities/GlobalProperty";
import { PropertyUseCases } from "@application/usecases/PropertyUseCases";
import { startupManager } from "@model/startup/startupManager.svelte";

interface ControllerState {
   isLoading: boolean;
   lastError: string | null;
   lastSuccess: string | null;
   selectedGlobalPropertyId: string | null;
}

/**
 * Controlador ligero para propiedades globales
 * Delega toda la lógica compleja a PropertyUseCases
 * Mantiene solo estado reactivo y métodos de conveniencia para la UI
 */
class GlobalPropertyController {
   private state = $state<ControllerState>({
      isLoading: false,
      lastError: null,
      lastSuccess: null,
      selectedGlobalPropertyId: null,
   });

   private get propertyUseCases(): PropertyUseCases {
      return startupManager.getService("propertyUseCases");
   }

   private get globalPropertyRepository() {
      return startupManager.getService("globalPropertyRepository");
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

   get selectedGlobalPropertyId(): string | null {
      return this.state.selectedGlobalPropertyId;
   }

   /**
    * Limpia mensajes de error y éxito
    */
   clearMessages(): void {
      this.state.lastError = null;
      this.state.lastSuccess = null;
   }

   /**
    * Selecciona una propiedad global (para UI)
    */
   selectGlobalProperty(globalPropertyId: string | null): void {
      this.state.selectedGlobalPropertyId = globalPropertyId;
   }

   // ============================================================================
   // GLOBAL PROPERTY OPERATIONS - Operaciones de propiedades globales
   // ============================================================================

   /**
    * Crea una nueva propiedad global independiente
    */
   async createGlobalProperty(name: string, type: string): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.createGlobalProperty(
            name,
            type,
         );

         if (result.success) {
            this.state.lastSuccess = `Propiedad global "${name}" creada correctamente`;
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al crear propiedad global";
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
    * Renombra una propiedad global y actualiza todas las propiedades vinculadas
    */
   async renameGlobalProperty(
      globalPropertyId: string,
      newName: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.updateGlobalProperty(
            globalPropertyId,
            { name: newName },
         );

         if (result.success) {
            const updatedCount = result.updatedNotes?.length || 0;
            this.state.lastSuccess =
               updatedCount > 0
                  ? `Propiedad renombrada a "${newName}" y ${updatedCount} nota(s) actualizada(s)`
                  : `Propiedad renombrada a "${newName}"`;
            return true;
         } else {
            if (result.conflictingProperty) {
               this.state.lastError = `Ya existe una propiedad global con el nombre "${newName}"`;
            } else {
               this.state.lastError =
                  result.error || "Error desconocido al renombrar";
            }
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
    * Cambia el tipo de una propiedad global
    */
   async updateGlobalPropertyType(
      globalPropertyId: string,
      newType: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.updateGlobalProperty(
            globalPropertyId,
            { type: newType },
         );

         if (result.success) {
            this.state.lastSuccess = `Tipo actualizado a "${newType}"`;
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
    * Elimina una propiedad global si no tiene vínculos
    */
   async deleteGlobalPropertyById(globalPropertyId: string): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result =
            await this.propertyUseCases.deleteGlobalProperty(globalPropertyId);

         if (result.success) {
            this.state.lastSuccess = "Propiedad global eliminada correctamente";
            // Limpiar selección si era la propiedad eliminada
            if (this.state.selectedGlobalPropertyId === globalPropertyId) {
               this.state.selectedGlobalPropertyId = null;
            }
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
    * Combina dos propiedades globales (para resolver conflictos de nombres)
    */
   async mergeGlobalProperties(
      sourceGlobalPropertyId: string,
      targetGlobalPropertyId: string,
   ): Promise<boolean> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.mergeGlobalProperties(
            sourceGlobalPropertyId,
            targetGlobalPropertyId,
         );

         if (result.success) {
            const updatedCount = result.updatedNotes?.length || 0;
            this.state.lastSuccess = `Propiedades combinadas correctamente. ${updatedCount} nota(s) actualizada(s)`;

            // Limpiar selección si era una de las propiedades combinadas
            if (
               this.state.selectedGlobalPropertyId === sourceGlobalPropertyId
            ) {
               this.state.selectedGlobalPropertyId = targetGlobalPropertyId;
            }
            return true;
         } else {
            this.state.lastError =
               result.error || "Error desconocido al combinar propiedades";
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

   // ============================================================================
   // QUERY METHODS - Métodos de consulta (sin estado de carga)
   // ============================================================================

   /**
    * Obtiene todas las propiedades globales
    */
   getGlobalProperties(): GlobalProperty[] {
      return this.globalPropertyRepository.findAll();
   }

   /**
    * Obtiene una propiedad global por ID
    */
   getGlobalPropertyById(id: string): GlobalProperty | undefined {
      return this.globalPropertyRepository.findById(id);
   }

   /**
    * Obtiene una propiedad global por nombre
    */
   getGlobalPropertyByName(name: string): GlobalProperty | undefined {
      return this.globalPropertyRepository.findByName(name);
   }

   /**
    * Busca propiedades globales por término
    */
   searchGlobalProperties(searchTerm: string): GlobalProperty[] {
      return this.globalPropertyRepository.search(searchTerm);
   }

   /**
    * Obtiene propiedades globales vinculadas a una nota
    */
   getGlobalPropertiesLinkedToNote(noteId: string): GlobalProperty[] {
      return this.globalPropertyRepository.findLinkedToNote(noteId);
   }

   /**
    * Obtiene propiedades globales huérfanas (sin vínculos)
    */
   getOrphanedGlobalProperties(): GlobalProperty[] {
      return this.globalPropertyRepository.findOrphaned();
   }

   /**
    * Obtiene propiedades globales por tipo
    */
   getGlobalPropertiesByType(type: string): GlobalProperty[] {
      return this.globalPropertyRepository.findByType(type);
   }

   /**
    * Obtiene sugerencias de propiedades globales (delegado)
    */
   getGlobalPropertiesSuggestions(
      searchTerm: string,
      noteId?: string,
   ): GlobalProperty[] {
      return this.propertyUseCases.getGlobalPropertySuggestions(
         searchTerm,
         noteId,
      );
   }

   // ============================================================================
   // VALIDATION HELPERS - Métodos de ayuda para validación en UI
   // ============================================================================

   /**
    * Verifica si se puede crear una propiedad global
    */
   canCreateGlobalProperty(
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

      if (this.globalPropertyRepository.existsByName(name)) {
         errors.push("Ya existe una propiedad global con este nombre");
      }

      return {
         valid: errors.length === 0,
         errors,
      };
   }

   /**
    * Verifica si se puede renombrar una propiedad global
    */
   canRenameGlobalProperty(
      globalPropertyId: string,
      newName: string,
   ): {
      valid: boolean;
      errors: string[];
   } {
      const errors: string[] = [];

      if (!newName.trim()) {
         errors.push("El nombre no puede estar vacío");
      }

      const existing = this.getGlobalPropertyByName(newName);
      if (existing && existing.id !== globalPropertyId) {
         errors.push("Ya existe una propiedad global con este nombre");
      }

      return {
         valid: errors.length === 0,
         errors,
      };
   }

   /**
    * Verifica si se puede eliminar una propiedad global
    */
   canDeleteGlobalProperty(globalPropertyId: string): {
      canDelete: boolean;
      reason?: string;
      linkedCount?: number;
   } {
      const globalProperty = this.getGlobalPropertyById(globalPropertyId);

      if (!globalProperty) {
         return { canDelete: false, reason: "Propiedad no encontrada" };
      }

      if (!globalProperty.canBeDeleted()) {
         return {
            canDelete: false,
            reason: "No se puede eliminar porque tiene propiedades vinculadas",
            linkedCount: globalProperty.getLinkCount(),
         };
      }

      return { canDelete: true };
   }

   // ============================================================================
   // UTILITY METHODS - Métodos de utilidad y estadísticas
   // ============================================================================

   /**
    * Obtiene estadísticas del repositorio
    */
   getGlobalPropertyStats() {
      return this.globalPropertyRepository.getStats();
   }

   /**
    * Obtiene estadísticas detalladas de una propiedad global
    */
   getGlobalPropertyDetailedStats(globalPropertyId: string) {
      const globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) {
         return null;
      }

      return this.propertyUseCases.getPropertySystemStats();
   }

   /**
    * Valida la integridad del sistema de propiedades
    */
   async validatePropertySystemIntegrity(autoFix: boolean = false) {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const result = await this.propertyUseCases.validateIntegrity(autoFix);

         if (result.isValid) {
            this.state.lastSuccess = "Sistema de propiedades íntegro";
         } else {
            const issueCount = result.issues.length;
            const fixedCount = result.autoFixedIssues || 0;
            this.state.lastError = autoFix
               ? `${issueCount} problema(s) encontrado(s), ${fixedCount} reparado(s) automáticamente`
               : `${issueCount} problema(s) de integridad encontrado(s)`;
         }

         return result;
      } catch (error) {
         this.state.lastError =
            error instanceof Error ? error.message : "Error inesperado";
         return {
            isValid: false,
            issues: [
               {
                  type: "validation_error",
                  message: "Error al validar integridad",
               },
            ],
         };
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Limpia propiedades globales huérfanas
    */
   async cleanupOrphanedProperties(): Promise<number> {
      this.state.isLoading = true;
      this.clearMessages();

      try {
         const removedCount = this.globalPropertyRepository.cleanupOrphaned();

         if (removedCount > 0) {
            this.state.lastSuccess = `${removedCount} propiedad(es) global(es) huérfana(s) eliminada(s)`;
         } else {
            this.state.lastSuccess = "No se encontraron propiedades huérfanas";
         }

         return removedCount;
      } catch (error) {
         this.state.lastError =
            error instanceof Error
               ? error.message
               : "Error al limpiar propiedades";
         return 0;
      } finally {
         this.state.isLoading = false;
      }
   }

   /**
    * Comprueba desajustes de tipo en una propiedad global
    */
   checkTypeMismatches(globalPropertyId: string) {
      const globalProperty = this.getGlobalPropertyById(globalPropertyId);
      if (!globalProperty) {
         return [];
      }

      // Esta operación requiere acceso a todas las notas, delegar al caso de uso
      return this.propertyUseCases.getPropertySystemStats();
   }
}

export const globalPropertyController = $state(new GlobalPropertyController());
