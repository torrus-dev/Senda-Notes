import { normalizeText } from "@utils/searchUtils";
import type { SearchResult } from "@projectTypes/ui/uiTypes";
import type { Note } from "@domain/entities/Note";

export interface SearchContext {
   term: string;
   normalizedTerm: string;
   isHierarchical: boolean;
   isExactPath: boolean;
   basePath: string;
   searchFragment: string;
}

export interface SearchOptions {
   limit?: number;
   includeContent?: boolean;
   caseSensitive?: boolean;
}

export interface NoteSearchData {
   note: Note;
   path: string;
}

/**
 * Servicio de búsqueda - Lógica pura sin dependencias externas
 * Maneja todos los algoritmos de búsqueda, parsing y ordenamiento
 */
export class SearchService {
   // ============================================================================
   // MAIN SEARCH METHOD - Método principal de búsqueda
   // ============================================================================

   /**
    * Realiza búsqueda en las notas proporcionadas
    */
   searchNotes(
      searchTerm: string,
      notesData: NoteSearchData[],
      options: SearchOptions = {},
   ): SearchResult[] {
      const { limit = -1, includeContent = false } = options;

      const context = this.parseSearchTerm(searchTerm);
      if (!context) return [];

      const results = context.isHierarchical
         ? this.performHierarchicalSearch(context, notesData, includeContent)
         : this.performSimpleSearch(context, notesData, includeContent);

      return this.limitResults(this.sortResults(results), limit);
   }

   // ============================================================================
   // SEARCH TERM PARSING - Parseo de términos de búsqueda
   // ============================================================================

   /**
    * Parsea el término de búsqueda y extrae contexto
    */
   parseSearchTerm(searchTerm: string): SearchContext | null {
      const term = searchTerm.trim();
      if (!term) return null;

      const normalizedTerm = normalizeText(term);
      const isHierarchical = term.includes("/");
      const isExactPath = isHierarchical && normalizedTerm.endsWith("/");

      let basePath = "";
      let searchFragment = normalizedTerm;

      if (isHierarchical) {
         const lastSlashIndex = normalizedTerm.lastIndexOf("/");
         basePath = normalizedTerm.substring(0, lastSlashIndex);
         searchFragment = isExactPath
            ? ""
            : normalizedTerm.substring(lastSlashIndex + 1);
      }

      return {
         term,
         normalizedTerm,
         isHierarchical,
         isExactPath,
         basePath,
         searchFragment,
      };
   }

   // ============================================================================
   // SEARCH ALGORITHMS - Algoritmos de búsqueda
   // ============================================================================

   /**
    * Búsqueda simple en todas las notas
    */
   private performSimpleSearch(
      context: SearchContext,
      notesData: NoteSearchData[],
      includeContent: boolean,
   ): SearchResult[] {
      const results: SearchResult[] = [];

      for (const { note, path } of notesData) {
         // Buscar en título
         if (this.searchInText(note.title, context.normalizedTerm)) {
            results.push(
               this.createSearchResult(note, path, "title", note.title),
            );
            continue;
         }

         // Buscar en aliases
         const aliasMatch = this.searchInAliases(note, context.normalizedTerm);
         if (aliasMatch) {
            results.push(
               this.createSearchResult(note, path, "alias", aliasMatch),
            );
            continue;
         }

         // Buscar en contenido si está habilitado
         if (
            includeContent &&
            this.searchInText(note.content, context.normalizedTerm)
         ) {
            const contentPreview = this.extractContentPreview(
               note.content,
               context.normalizedTerm,
            );
            results.push(
               this.createSearchResult(note, path, "content", contentPreview),
            );
         }
      }

      return results;
   }

   /**
    * Búsqueda jerárquica considerando rutas
    */
   private performHierarchicalSearch(
      context: SearchContext,
      notesData: NoteSearchData[],
      includeContent: boolean,
   ): SearchResult[] {
      const results: SearchResult[] = [];

      for (const { note, path } of notesData) {
         const normalizedPath = normalizeText(path);

         // Verificar si la nota está en la ruta correcta
         if (!this.isNoteInTargetPath(normalizedPath, context)) {
            continue;
         }

         // Para búsqueda exacta de directorio, agregar todas las notas en esa ruta
         if (context.isExactPath) {
            results.push(
               this.createSearchResult(note, path, "title", note.title),
            );
            continue;
         }

         // Buscar en título
         if (this.searchInText(note.title, context.searchFragment)) {
            results.push(
               this.createSearchResult(note, path, "title", note.title),
            );
            continue;
         }

         // Buscar en aliases
         const aliasMatch = this.searchInAliases(note, context.searchFragment);
         if (aliasMatch) {
            results.push(
               this.createSearchResult(note, path, "alias", aliasMatch),
            );
            continue;
         }

         // Buscar en contenido si está habilitado
         if (
            includeContent &&
            this.searchInText(note.content, context.searchFragment)
         ) {
            const contentPreview = this.extractContentPreview(
               note.content,
               context.searchFragment,
            );
            results.push(
               this.createSearchResult(note, path, "content", contentPreview),
            );
         }
      }

      return results;
   }

   // ============================================================================
   // SEARCH UTILITIES - Utilidades de búsqueda
   // ============================================================================

   /**
    * Verifica si una nota está en la ruta objetivo
    */
   private isNoteInTargetPath(
      notePath: string,
      context: SearchContext,
   ): boolean {
      if (context.isExactPath) {
         const searchPath = context.normalizedTerm.slice(0, -1); // Quitar barra final
         return (
            notePath === searchPath || notePath.startsWith(searchPath + "/")
         );
      }

      if (!context.basePath) return true;

      return (
         notePath.startsWith(context.basePath + "/") ||
         notePath === context.basePath
      );
   }

   /**
    * Busca texto en una cadena normalizada
    */
   private searchInText(text: string, searchTerm: string): boolean {
      return normalizeText(text).includes(searchTerm);
   }

   /**
    * Busca en los aliases de una nota
    */
   private searchInAliases(note: Note, searchTerm: string): string | null {
      const aliases = note.metadata?.aliases || [];

      for (const alias of aliases) {
         if (this.searchInText(alias, searchTerm)) {
            return alias;
         }
      }

      return null;
   }

   /**
    * Extrae preview del contenido alrededor del término encontrado
    */
   private extractContentPreview(
      content: string,
      searchTerm: string,
      maxLength: number = 100,
   ): string {
      const normalizedContent = normalizeText(content);
      const termIndex = normalizedContent.indexOf(searchTerm);

      if (termIndex === -1) return content.substring(0, maxLength) + "...";

      const start = Math.max(0, termIndex - 30);
      const end = Math.min(content.length, termIndex + searchTerm.length + 50);

      let preview = content.substring(start, end);

      if (start > 0) preview = "..." + preview;
      if (end < content.length) preview = preview + "...";

      return preview;
   }

   // ============================================================================
   // RESULT PROCESSING - Procesamiento de resultados
   // ============================================================================

   /**
    * Crea un resultado de búsqueda
    */
   private createSearchResult(
      note: Note,
      path: string,
      matchType: "title" | "alias" | "content",
      matchedText: string,
   ): SearchResult {
      return {
         note,
         matchType,
         matchedText,
         path,
      };
   }

   /**
    * Ordena los resultados por relevancia
    */
   private sortResults(results: SearchResult[]): SearchResult[] {
      return [...results].sort((a, b) => {
         // Prioridad 1: Tipo de coincidencia (título > alias > contenido)
         const typeOrder = { title: 0, alias: 1, content: 2 };
         const typeDiff = typeOrder[a.matchType] - typeOrder[b.matchType];
         if (typeDiff !== 0) return typeDiff;

         // Prioridad 2: Profundidad de ruta (menos profunda primero)
         const aDepth = a.path.split("/").length;
         const bDepth = b.path.split("/").length;
         if (aDepth !== bDepth) return aDepth - bDepth;

         // Prioridad 3: Longitud del texto coincidente (más corto = más relevante)
         const lengthDiff = a.matchedText.length - b.matchedText.length;
         if (lengthDiff !== 0) return lengthDiff;

         // Prioridad 4: Orden alfabético
         return a.matchedText.localeCompare(b.matchedText);
      });
   }

   /**
    * Limita el número de resultados
    */
   private limitResults(
      results: SearchResult[],
      limit: number,
   ): SearchResult[] {
      if (limit === -1) return results;
      if (limit <= 0) return [];
      return results.slice(0, limit);
   }

   // ============================================================================
   // UTILITY METHODS - Métodos de utilidad pública
   // ============================================================================

   /**
    * Valida si un término de búsqueda es válido
    */
   isValidSearchTerm(searchTerm: string): boolean {
      return searchTerm.trim().length > 0;
   }

   /**
    * Extrae sugerencias de búsqueda basadas en el término parcial
    */
   getSearchSuggestions(
      partialTerm: string,
      notesData: NoteSearchData[],
      maxSuggestions: number = 5,
   ): string[] {
      if (!partialTerm.trim()) return [];

      const normalizedPartial = normalizeText(partialTerm);
      const suggestions = new Set<string>();

      for (const { note } of notesData) {
         // Sugerencias de títulos
         const normalizedTitle = normalizeText(note.title);
         if (normalizedTitle.startsWith(normalizedPartial)) {
            suggestions.add(note.title);
         }

         // Sugerencias de aliases
         const aliases = note.metadata?.aliases || [];
         for (const alias of aliases) {
            const normalizedAlias = normalizeText(alias);
            if (normalizedAlias.startsWith(normalizedPartial)) {
               suggestions.add(alias);
            }
         }

         if (suggestions.size >= maxSuggestions) break;
      }

      return Array.from(suggestions).slice(0, maxSuggestions);
   }

   /**
    * Resalta el término de búsqueda en un texto
    */
   highlightSearchTerm(text: string, searchTerm: string): string {
      if (!searchTerm.trim()) return text;

      const normalizedText = normalizeText(text);
      const normalizedTerm = normalizeText(searchTerm);
      const termIndex = normalizedText.indexOf(normalizedTerm);

      if (termIndex === -1) return text;

      const originalTerm = text.substring(
         termIndex,
         termIndex + searchTerm.length,
      );
      return text.replace(
         new RegExp(this.escapeRegExp(originalTerm), "gi"),
         `<mark>$&</mark>`,
      );
   }

   /**
    * Escapa caracteres especiales para regex
    */
   private escapeRegExp(string: string): string {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
   }
}
