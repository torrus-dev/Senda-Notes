import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import type { SearchService } from "@domain/services/SearchService";
import type { SearchResult } from "@projectTypes/ui/uiTypes";

/**
 * Controlador de búsqueda - Solo maneja estado reactivo
 */
class SearchController {
   private get searchService(): SearchService {
      return startupManager.getService("searchService");
   }

   isSearching: boolean = $state(false);

   constructor() {
      // El servicio se inyectará desde startupManager después de la inicialización
   }

   searchNotes(searchTerm: string, limit: number = -1): SearchResult[] {
      return this.searchService.searchNotes(searchTerm, limit);
   }
}

export const searchController = $state(new SearchController());
