import { GlobalProperty } from "@domain/entities/GlobalProperty";
import { LocalStorageAdapter } from "@infrastructure/persistence/LocalStorageAdapter.svelte";
import { normalizeText } from "@utils/searchUtils";

interface GlobalPropertyData {
   globalProperties: any[]; // Objetos planos para persistencia
}

/**
 * Repositorio para GlobalProperty (comandos y consultas)
 * Las propiedades globales son más simples, por lo que combinamos Command y Query en un solo repositorio
 */
export class GlobalPropertyRepository extends LocalStorageAdapter<GlobalPropertyData> {
   constructor() {
      super("globalProperties");
   }

   protected getDefaultData(): GlobalPropertyData {
      return { globalProperties: [] };
   }

   protected deserializeData(data: any): GlobalPropertyData {
      if (!data.globalProperties || !Array.isArray(data.globalProperties)) {
         return { globalProperties: [] };
      }
      return data;
   }

   // ============================================================================
   // COMMAND OPERATIONS - Operaciones que modifican estado
   // ============================================================================

   /**
    * Crea una nueva propiedad global
    */
   create(globalProperty: GlobalProperty): void {
      this.data.globalProperties.push(globalProperty.toPlainObject());
      this.save();
   }

   /**
    * Actualiza una propiedad global existente
    */
   update(
      globalPropertyId: string,
      updatedGlobalProperty: GlobalProperty,
   ): void {
      const index = this.data.globalProperties.findIndex(
         (gp) => gp.id === globalPropertyId,
      );
      if (index !== -1) {
         this.data.globalProperties[index] =
            updatedGlobalProperty.toPlainObject();
         this.save();
      }
   }

   delete(globalPropertyId: string): void {
      this.data.globalProperties = this.data.globalProperties.filter(
         (gp) => gp.id !== globalPropertyId,
      );
      this.save();
   }

   // ============================================================================
   // QUERY OPERATIONS - Operaciones de consulta
   // ============================================================================

   /**
    * Obtiene todas las propiedades globales como entidades
    */
   findAll(): GlobalProperty[] {
      return this.data.globalProperties.map((gpData) =>
         GlobalProperty.fromPlainObject(gpData),
      );
   }

   /**
    * Busca una propiedad global por ID
    */
   findById(globalPropertyId: string): GlobalProperty | undefined {
      const gpData = this.data.globalProperties.find(
         (gp) => gp.id === globalPropertyId,
      );
      return gpData ? GlobalProperty.fromPlainObject(gpData) : undefined;
   }

   /**
    * Busca una propiedad global por nombre (normalizado)
    */
   findByName(name: string): GlobalProperty | undefined {
      const normalizedName = normalizeText(name.trim());
      const gpData = this.data.globalProperties.find(
         (gp) => normalizeText(gp.name) === normalizedName,
      );
      return gpData ? GlobalProperty.fromPlainObject(gpData) : undefined;
   }

   /**
    * Busca propiedades globales por nombres (útil para validaciones)
    */
   findByNames(names: string[]): GlobalProperty[] {
      const normalizedNames = names.map((name) => normalizeText(name.trim()));
      return this.data.globalProperties
         .filter((gp) => normalizedNames.includes(normalizeText(gp.name)))
         .map((gpData) => GlobalProperty.fromPlainObject(gpData));
   }

   /**
    * Verifica si existe una propiedad global con el nombre dado
    */
   existsByName(name: string): boolean {
      return this.findByName(name) !== undefined;
   }

   /**
    * Obtiene propiedades globales que coincidan con un término de búsqueda
    */
   search(searchTerm: string): GlobalProperty[] {
      if (!searchTerm.trim()) {
         return this.findAll();
      }

      const normalizedSearchTerm = normalizeText(searchTerm);
      return this.data.globalProperties
         .filter((gp) => normalizeText(gp.name).includes(normalizedSearchTerm))
         .map((gpData) => GlobalProperty.fromPlainObject(gpData));
   }

   /**
    * Obtiene propiedades globales vinculadas a una nota específica
    */
   findLinkedToNote(noteId: string): GlobalProperty[] {
      return this.data.globalProperties
         .filter(
            (gp) =>
               gp.linkedProperties &&
               gp.linkedProperties.some((link: any) => link.noteId === noteId),
         )
         .map((gpData) => GlobalProperty.fromPlainObject(gpData));
   }

   /**
    * Obtiene propiedades globales que no tienen vínculos (huérfanas)
    */
   findOrphaned(): GlobalProperty[] {
      return this.data.globalProperties
         .filter(
            (gp) => !gp.linkedProperties || gp.linkedProperties.length === 0,
         )
         .map((gpData) => GlobalProperty.fromPlainObject(gpData));
   }

   /**
    * Obtiene propiedades globales de un tipo específico
    */
   findByType(type: string): GlobalProperty[] {
      return this.data.globalProperties
         .filter((gp) => gp.type === type)
         .map((gpData) => GlobalProperty.fromPlainObject(gpData));
   }

   /**
    * Cuenta el número total de propiedades globales
    */
   count(): number {
      return this.data.globalProperties.length;
   }

   /**
    * Cuenta propiedades globales por tipo
    */
   countByType(): Record<string, number> {
      const counts: Record<string, number> = {};
      for (const gp of this.data.globalProperties) {
         counts[gp.type] = (counts[gp.type] || 0) + 1;
      }
      return counts;
   }

   /**
    * Obtiene estadísticas básicas del repositorio
    */
   getStats(): {
      total: number;
      withLinks: number;
      orphaned: number;
      byType: Record<string, number>;
   } {
      const total = this.data.globalProperties.length;
      let withLinks = 0;
      let orphaned = 0;
      const byType: Record<string, number> = {};

      for (const gp of this.data.globalProperties) {
         // Contar por tipo
         byType[gp.type] = (byType[gp.type] || 0) + 1;

         // Contar con/sin vínculos
         if (gp.linkedProperties && gp.linkedProperties.length > 0) {
            withLinks++;
         } else {
            orphaned++;
         }
      }

      return {
         total,
         withLinks,
         orphaned,
         byType,
      };
   }

   // ============================================================================
   // UTILITY METHODS - Métodos de utilidad
   // ============================================================================

   /**
    * Obtiene todos los objetos planos (útil para migraciones o debugging)
    */
   getAllPlainObjects(): any[] {
      return this.data.globalProperties;
   }

   /**
    * Valida la integridad de los datos en el repositorio
    */
   validateIntegrity(): Array<{
      id: string;
      issue: string;
   }> {
      const issues: Array<{ id: string; issue: string }> = [];

      for (const gp of this.data.globalProperties) {
         // Validar campos requeridos
         if (!gp.id) {
            issues.push({ id: gp.id || "unknown", issue: "Missing ID" });
         }
         if (!gp.name || !gp.name.trim()) {
            issues.push({ id: gp.id, issue: "Missing or empty name" });
         }
         if (!gp.type || !gp.type.trim()) {
            issues.push({ id: gp.id, issue: "Missing or empty type" });
         }

         // Validar estructura de linkedProperties
         if (gp.linkedProperties && !Array.isArray(gp.linkedProperties)) {
            issues.push({
               id: gp.id,
               issue: "linkedProperties is not an array",
            });
         }

         // Validar estructura de metadata
         if (!gp.metadata) {
            issues.push({ id: gp.id, issue: "Missing metadata" });
         } else {
            if (!gp.metadata.created) {
               issues.push({ id: gp.id, issue: "Missing metadata.created" });
            }
            if (!gp.metadata.modified) {
               issues.push({ id: gp.id, issue: "Missing metadata.modified" });
            }
         }
      }

      return issues;
   }

   /**
    * Limpia propiedades globales huérfanas (sin vínculos)
    */
   cleanupOrphaned(): number {
      const initialCount = this.data.globalProperties.length;
      this.data.globalProperties = this.data.globalProperties.filter(
         (gp) => gp.linkedProperties && gp.linkedProperties.length > 0,
      );
      this.save();
      return initialCount - this.data.globalProperties.length;
   }
}
