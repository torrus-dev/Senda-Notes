import type { Note } from "@projectTypes/noteTypes";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { removeDiacritics } from "@utils/noteUtils";

export interface SearchResult {
   note: Note;
   matchType: "title" | "alias";
   matchedText: string;
   path: string;
}

class SearchController {
   // Almacena los últimos resultados de búsqueda
   private lastResults: SearchResult[] = $state([]);
   isSearching: boolean = $state(false);

   // Obtiene los resultados de la última búsqueda
   getLastResults(): SearchResult[] {
      return this.lastResults;
   }

   // Busca notas según un término de búsqueda
   searchNotes(searchTerm: string, limit: number = 10): SearchResult[] {
      // Limpiar término de búsqueda
      const term = searchTerm.trim();
      if (!term) {
         this.lastResults = [];
         return [];
      }

      // Normalizar el término de búsqueda
      const normalizedTerm = removeDiacritics(term.toLowerCase());

      // Seleccionar tipo de búsqueda
      const results = term.includes("/")
         ? this.hierarchicalSearch(normalizedTerm)
         : this.simpleSearch(normalizedTerm);

      // Ordenar y limitar resultados
      const sortedResults = this.sortResults(results);
      const limitedResults = sortedResults.slice(0, limit);

      this.lastResults = limitedResults;
      return limitedResults;
   }

   // Búsqueda simple: encuentra notas cuyo título o alias contenga el término
   private simpleSearch(normalizedTerm: string): SearchResult[] {
      const results: SearchResult[] = [];
      const allNotes = noteQueryController.getAllNotes() || [];

      for (const note of allNotes) {
         // Buscar en título
         const normalizedTitle = removeDiacritics(note.title.toLowerCase());
         if (normalizedTitle.includes(normalizedTerm)) {
            results.push({
               note,
               matchType: "title",
               matchedText: note.title,
               path: noteQueryController.getPathFromNoteId(note.id),
            });
            continue;
         }

         // Buscar en aliases
         const aliases = note.metadata?.aliases || [];
         for (const alias of aliases) {
            const normalizedAlias = removeDiacritics(alias.toLowerCase());
            if (normalizedAlias.includes(normalizedTerm)) {
               results.push({
                  note,
                  matchType: "alias",
                  matchedText: alias,
                  path: noteQueryController.getPathFromNoteId(note.id),
               });
               break;
            }
         }
      }

      return results;
   }

   // Búsqueda jerárquica: encuentra notas dentro de una ruta específica
   private hierarchicalSearch(normalizedTerm: string): SearchResult[] {
      const results: SearchResult[] = [];

      // Determinar si es búsqueda exacta de directorio
      const isExactPathSearch = normalizedTerm.endsWith("/");

      // Obtener ruta base y término de búsqueda
      const lastSlashIndex = normalizedTerm.lastIndexOf("/");
      const basePath = normalizedTerm.substring(0, lastSlashIndex);
      const searchFragment = isExactPathSearch
         ? ""
         : normalizedTerm.substring(lastSlashIndex + 1);

      // Obtener todas las notas
      const allNotes = noteQueryController.getAllNotes() || [];

      for (const note of allNotes) {
         // Obtener y normalizar la ruta de la nota
         const notePath = removeDiacritics(
            noteQueryController.getPathFromNoteId(note.id).toLowerCase(),
         );

         // Para búsqueda exacta de directorio
         if (isExactPathSearch) {
            const searchPath = normalizedTerm.slice(0, -1); // Quitar la barra final
            if (
               notePath === searchPath ||
               notePath.startsWith(searchPath + "/")
            ) {
               results.push({
                  note,
                  matchType: "title",
                  matchedText: note.title,
                  path: noteQueryController.getPathFromNoteId(note.id),
               });
            }
            continue;
         }

         // Para búsqueda con ruta parcial
         if (
            basePath &&
            !notePath.startsWith(basePath + "/") &&
            notePath !== basePath
         ) {
            continue; // No está en la ruta especificada
         }

         // Buscar en título
         const normalizedTitle = removeDiacritics(note.title.toLowerCase());
         if (normalizedTitle.includes(searchFragment)) {
            results.push({
               note,
               matchType: "title",
               matchedText: note.title,
               path: noteQueryController.getPathFromNoteId(note.id),
            });
            continue;
         }

         // Buscar en aliases
         const aliases = note.metadata?.aliases || [];
         for (const alias of aliases) {
            const normalizedAlias = removeDiacritics(alias.toLowerCase());
            if (normalizedAlias.includes(searchFragment)) {
               results.push({
                  note,
                  matchType: "alias",
                  matchedText: alias,
                  path: noteQueryController.getPathFromNoteId(note.id),
               });
               break;
            }
         }
      }

      return results;
   }

   // Ordenar resultados por relevancia
   private sortResults(results: SearchResult[]): SearchResult[] {
      return [...results].sort((a, b) => {
         // Prioridad 1: Coincidencias de título sobre alias
         if (a.matchType === "title" && b.matchType === "alias") return -1;
         if (a.matchType === "alias" && b.matchType === "title") return 1;

         // Prioridad 2: Profundidad de ruta (menos profunda primero)
         const aDepth = a.path.split("/").length;
         const bDepth = b.path.split("/").length;
         if (aDepth !== bDepth) return aDepth - bDepth;

         // Prioridad 3: Orden alfabético
         return a.matchedText.localeCompare(b.matchedText);
      });
   }
}

export const searchController = $state(new SearchController());
