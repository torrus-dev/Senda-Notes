import type { Note } from "@projectTypes/noteTypes";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import { removeDiacritics } from "@utils/noteUtils";

export interface SearchResult {
   note: Note;
   matchType: "title" | "alias";
   matchedText: string;
   path: string;
   relevanceScore: number; // Puntuación para determinar relevancia
}

class SearchController {
   // Almacena los resultados actuales de búsqueda
   private results: SearchResult[] = $state([]);

   // Estado de la búsqueda actual
   private searchTerm: string = $state("");
   private isSearching: boolean = $state(false);

   // Configuración
   private maxResults: number = $state(10);

   // Getters para el estado actual
   getResults(): SearchResult[] {
      return this.results;
   }

   getSearchTerm(): string {
      return this.searchTerm;
   }

   isCurrentlySearching(): boolean {
      return this.isSearching;
   }

   setMaxResults(max: number): void {
      this.maxResults = max;
   }

   // Método principal para realizar una búsqueda
   search(term: string): SearchResult[] {
      this.searchTerm = term;

      // Verificar caso vacío
      if (!term.trim()) {
         this.clearResults();
         return [];
      }

      this.isSearching = true;

      // Normalizar el término de búsqueda
      const normalizedTerm = removeDiacritics(term.toLowerCase().trim());

      let searchResults: SearchResult[];

      // Verificar si es búsqueda jerárquica
      if (term.includes("/")) {
         searchResults = this.hierarchicalSearch(normalizedTerm);
      } else {
         searchResults = this.simpleSearch(normalizedTerm);
      }

      // Ordenar y limitar resultados
      const sortedResults = this.sortResultsByRelevance(searchResults);
      const limitedResults = sortedResults.slice(0, this.maxResults);

      this.results = limitedResults;
      return limitedResults;
   }

   // Limpiar resultados de búsqueda
   clearResults(): void {
      this.results = [];
      this.isSearching = false;
   }

   // Búsqueda simple: encuentra notas cuyo título o alias contenga el término
   private simpleSearch(normalizedTerm: string): SearchResult[] {
      // Usar el controlador para obtener todas las notas
      const allNotes = noteQueryController.getAllNotes();
      const results: SearchResult[] = [];

      for (const note of allNotes) {
         const matches = this.findMatches(note, normalizedTerm, "");
         results.push(...matches);
      }

      return results;
   }

   // Búsqueda jerárquica: encuentra notas dentro de una ruta específica
   private hierarchicalSearch(normalizedTerm: string): SearchResult[] {
      // Manejar caso especial de solo "/"
      if (normalizedTerm === "/") {
         return this.getRootNotesAsResults();
      }

      // Dividir la búsqueda en segmentos de ruta
      const segments = normalizedTerm.split("/");
      const isExactPathSearch = normalizedTerm.endsWith("/");

      let searchPath: string;
      let searchFragment: string;

      if (isExactPathSearch) {
         searchPath = segments.slice(0, segments.length - 1).join("/");
         searchFragment = ""; // Buscar todo en la ruta
      } else {
         searchPath = segments.slice(0, segments.length - 1).join("/");
         searchFragment = segments[segments.length - 1];
      }

      // Obtener todas las notas
      const allNotes = noteQueryController.getAllNotes();
      const results: SearchResult[] = [];

      for (const note of allNotes) {
         const notePath = removeDiacritics(
            noteQueryController.getPathFromNoteId(note.id).toLowerCase(),
         );

         // Verificar si la nota está en la ruta correcta
         if (searchPath && !this.isNoteInPath(note, searchPath)) {
            continue;
         }

         // Si es búsqueda exacta de ruta, agregar todas las notas en la ruta
         if (isExactPathSearch) {
            results.push({
               note,
               matchType: "title",
               matchedText: note.title,
               path: noteQueryController.getPathFromNoteId(note.id),
               relevanceScore: this.calculateRelevanceScore(
                  note.title,
                  "",
                  "title",
               ),
            });
         }
         // Si no, buscar el fragmento en el título y alias
         else if (searchFragment) {
            const matches = this.findMatches(note, searchFragment, searchPath);
            results.push(...matches);
         }
      }

      return results;
   }

   // Verifica si una nota está en una ruta específica
   private isNoteInPath(note: Note, path: string): boolean {
      const notePath = removeDiacritics(
         noteQueryController.getPathFromNoteId(note.id).toLowerCase(),
      );
      return notePath === path || notePath.startsWith(path + "/");
   }

   // Obtiene las notas raíz como resultados de búsqueda
   private getRootNotesAsResults(): SearchResult[] {
      const rootNotes = noteQueryController.getRootNotes();
      return rootNotes.map((note) => ({
         note,
         matchType: "title" as const,
         matchedText: note.title,
         path: note.title,
         relevanceScore: 100, // Alta prioridad para notas raíz
      }));
   }

   // Busca coincidencias en el título y alias de una nota
   private findMatches(
      note: Note,
      searchTerm: string,
      basePath: string,
   ): SearchResult[] {
      const matches: SearchResult[] = [];
      const path = noteQueryController.getPathFromNoteId(note.id);

      // Buscar en título
      const normalizedTitle = removeDiacritics(note.title.toLowerCase());
      if (normalizedTitle.includes(searchTerm)) {
         matches.push({
            note,
            matchType: "title",
            matchedText: note.title,
            path,
            relevanceScore: this.calculateRelevanceScore(
               note.title,
               searchTerm,
               "title",
            ),
         });
      }

      // Buscar en aliases
      const aliases = note.metadata.aliases || [];
      for (const alias of aliases) {
         const normalizedAlias = removeDiacritics(alias.toLowerCase());
         if (normalizedAlias.includes(searchTerm)) {
            matches.push({
               note,
               matchType: "alias",
               matchedText: alias,
               path,
               relevanceScore: this.calculateRelevanceScore(
                  alias,
                  searchTerm,
                  "alias",
               ),
            });
         }
      }

      return matches;
   }

   // Calcula la puntuación de relevancia de un resultado
   private calculateRelevanceScore(
      text: string,
      searchTerm: string,
      matchType: "title" | "alias",
   ): number {
      let score = 0;

      // Criterio 1: Tipo de coincidencia
      if (matchType === "title") {
         score += 50; // Prioridad para títulos
      }

      // Criterio 2: Coincidencia exacta o parcial
      const normalizedText = removeDiacritics(text.toLowerCase());
      const normalizedTerm = searchTerm.toLowerCase();

      if (normalizedText === normalizedTerm) {
         score += 100; // Coincidencia exacta
      } else if (normalizedText.startsWith(normalizedTerm)) {
         score += 75; // Coincidencia al inicio
      } else if (normalizedText.includes(" " + normalizedTerm)) {
         score += 50; // Coincidencia al inicio de palabra
      }

      // Criterio 3: Longitud del texto (preferencia por textos más cortos)
      score += Math.max(0, 30 - text.length); // Máximo 30 puntos por brevedad

      return score;
   }

   // Ordena los resultados por relevancia
   private sortResultsByRelevance(results: SearchResult[]): SearchResult[] {
      return [...results].sort((a, b) => {
         // Primero ordenar por puntuación de relevancia
         if (a.relevanceScore !== b.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
         }

         // Luego por profundidad de ruta (menos profunda primero)
         const aDepth = a.path.split("/").length;
         const bDepth = b.path.split("/").length;
         if (aDepth !== bDepth) {
            return aDepth - bDepth;
         }

         // Finalmente por orden alfabético
         return a.matchedText.localeCompare(b.matchedText);
      });
   }

   // Navega al resultado seleccionado
   navigateToResult(result: SearchResult): void {
      // Aquí implementaremos la navegación a la nota seleccionada
      // Esta funcionalidad se completará cuando integremos con el componente NavigationBar
      console.log(`Navegando a: ${result.path}`);
   }
}

export const searchController = $state(new SearchController());
