import {
   SearchService,
   type SearchOptions,
   type NoteSearchData,
} from "@domain/services/SearchService";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import type { SearchResult } from "@projectTypes/ui/uiTypes";

interface SearchState {
   isSearching: boolean;
   results: SearchResult[];
   lastSearchTerm: string;
   suggestions: string[];
   error: string | null;
}

/**
 * Controlador minimalista de búsqueda
 * Maneja solo estado reactivo y delega toda la lógica al SearchService
 */
class SearchController {
   private state = $state<SearchState>({
      isSearching: false,
      results: [],
      lastSearchTerm: "",
      suggestions: [],
      error: null,
   });

   private searchService = new SearchService();

   // ============================================================================
   // STATE ACCESSORS - Acceso al estado reactivo
   // ============================================================================

   get isSearching(): boolean {
      return this.state.isSearching;
   }
   set isSearching(newValue: boolean) {
      this.state.isSearching = newValue;
   }

   get results(): SearchResult[] {
      return this.state.results;
   }

   get lastSearchTerm(): string {
      return this.state.lastSearchTerm;
   }

   get suggestions(): string[] {
      return this.state.suggestions;
   }

   get error(): string | null {
      return this.state.error;
   }

   get hasResults(): boolean {
      return this.state.results.length > 0;
   }

   get resultCount(): number {
      return this.state.results.length;
   }

   // ============================================================================
   // SEARCH OPERATIONS - Operaciones de búsqueda
   // ============================================================================

   /**
    * Realiza búsqueda de notas
    */
   async searchNotes(
      searchTerm: string,
      options: SearchOptions = {},
   ): Promise<void> {
      // Limpiar estado anterior
      this.clearError();

      // Validación rápida
      if (!this.searchService.isValidSearchTerm(searchTerm)) {
         this.state.results = [];
         this.state.lastSearchTerm = "";
         return;
      }

      this.state.isSearching = true;

      try {
         // Obtener datos de notas
         const notesData = this.prepareNotesData();

         // Delegar búsqueda al servicio
         const results = this.searchService.searchNotes(
            searchTerm,
            notesData,
            options,
         );

         // Actualizar estado
         this.state.results = results;
         this.state.lastSearchTerm = searchTerm;
      } catch (error) {
         this.state.error =
            error instanceof Error
               ? error.message
               : "Error inesperado en la búsqueda";
         this.state.results = [];
      } finally {
         this.state.isSearching = false;
      }
   }

   /**
    * Búsqueda rápida sin estado de loading (para autocompletado)
    */
   quickSearch(searchTerm: string, limit: number = 10): SearchResult[] {
      if (!this.searchService.isValidSearchTerm(searchTerm)) {
         return [];
      }

      try {
         const notesData = this.prepareNotesData();
         return this.searchService.searchNotes(searchTerm, notesData, {
            limit,
         });
      } catch (error) {
         console.warn("Error en búsqueda rápida:", error);
         return [];
      }
   }

   /**
    * Obtiene sugerencias de búsqueda
    */
   async getSuggestions(
      partialTerm: string,
      maxSuggestions: number = 5,
   ): Promise<void> {
      if (!partialTerm.trim()) {
         this.state.suggestions = [];
         return;
      }

      try {
         const notesData = this.prepareNotesData();
         const suggestions = this.searchService.getSearchSuggestions(
            partialTerm,
            notesData,
            maxSuggestions,
         );
         this.state.suggestions = suggestions;
      } catch (error) {
         console.warn("Error obteniendo sugerencias:", error);
         this.state.suggestions = [];
      }
   }

   // ============================================================================
   // SEARCH UTILITIES - Utilidades de búsqueda
   // ============================================================================

   /**
    * Resalta término de búsqueda en texto
    */
   highlightSearchTerm(text: string, searchTerm?: string): string {
      const term = searchTerm || this.state.lastSearchTerm;
      return this.searchService.highlightSearchTerm(text, term);
   }

   /**
    * Valida si un término de búsqueda es válido
    */
   isValidSearchTerm(searchTerm: string): boolean {
      return this.searchService.isValidSearchTerm(searchTerm);
   }

   /**
    * Parsea término de búsqueda para mostrar información en UI
    */
   parseSearchTerm(searchTerm: string) {
      return this.searchService.parseSearchTerm(searchTerm);
   }

   // ============================================================================
   // STATE MANAGEMENT - Gestión de estado
   // ============================================================================

   /**
    * Limpia los resultados de búsqueda
    */
   clearResults(): void {
      this.state.results = [];
      this.state.lastSearchTerm = "";
      this.state.suggestions = [];
      this.clearError();
   }

   /**
    * Limpia el error
    */
   clearError(): void {
      this.state.error = null;
   }

   /**
    * Refresca la búsqueda actual (útil cuando cambian las notas)
    */
   async refreshSearch(): Promise<void> {
      if (this.state.lastSearchTerm) {
         await this.searchNotes(this.state.lastSearchTerm);
      }
   }

   // ============================================================================
   // FILTERING AND SORTING - Filtrado y ordenamiento adicional
   // ============================================================================

   /**
    * Filtra resultados por tipo de coincidencia
    */
   filterResultsByType(
      matchType: "title" | "alias" | "content",
   ): SearchResult[] {
      return this.state.results.filter(
         (result) => result.matchType === matchType,
      );
   }

   /**
    * Agrupa resultados por ruta padre
    */
   groupResultsByPath(): Record<string, SearchResult[]> {
      const grouped: Record<string, SearchResult[]> = {};

      for (const result of this.state.results) {
         const pathParts = result.path.split("/");
         const parentPath = pathParts.slice(0, -1).join("/") || "Root";

         if (!grouped[parentPath]) {
            grouped[parentPath] = [];
         }
         grouped[parentPath].push(result);
      }

      return grouped;
   }

   /**
    * Obtiene estadísticas de los resultados
    */
   getResultStats(): {
      total: number;
      byType: Record<string, number>;
      byDepth: Record<number, number>;
   } {
      const byType: Record<string, number> = {};
      const byDepth: Record<number, number> = {};

      for (const result of this.state.results) {
         // Por tipo
         byType[result.matchType] = (byType[result.matchType] || 0) + 1;

         // Por profundidad
         const depth = result.path.split("/").length;
         byDepth[depth] = (byDepth[depth] || 0) + 1;
      }

      return {
         total: this.state.results.length,
         byType,
         byDepth,
      };
   }

   // ============================================================================
   // PRIVATE HELPERS - Métodos auxiliares privados
   // ============================================================================

   /**
    * Prepara los datos de notas para el servicio de búsqueda
    */
   private prepareNotesData(): NoteSearchData[] {
      const allNotes = noteQueryController.getAllNotes() || [];

      return allNotes.map((note) => ({
         note,
         path: noteQueryController.getNotePathAsString(note.id),
      }));
   }
}

export const searchController = $state(new SearchController());
