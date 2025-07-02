import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { normalizeText } from "@utils/searchUtils";
import type { SearchResult } from "@projectTypes/ui/uiTypes";

interface SearchContext {
   term: string;
   normalizedTerm: string;
   isHierarchical: boolean;
   isExactPath: boolean;
   basePath: string;
   searchFragment: string;
}

class SearchController {
   isSearching: boolean = $state(false);

   // Función principal de búsqueda
   searchNotes(searchTerm: string, limit: number = -1): SearchResult[] {
      const context = this.parseSearchTerm(searchTerm);
      if (!context) return [];

      const results = context.isHierarchical
         ? this.performHierarchicalSearch(context)
         : this.performSimpleSearch(context);

      return this.limitResults(this.sortResults(results), limit);
   }

   // Parsear y preparar el término de búsqueda
   public parseSearchTerm(searchTerm: string): SearchContext | null {
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

   // Búsqueda simple: encuentra notas cuyo título o alias contenga el término
   private performSimpleSearch(context: SearchContext): SearchResult[] {
      const results: SearchResult[] = [];
      const allNotes = noteQueryController.getAllNotes() || [];

      for (const note of allNotes) {
         // Buscar en título
         const titleMatch = this.searchInText(
            note.title,
            context.normalizedTerm,
         );
         if (titleMatch) {
            results.push(this.createSearchResult(note, "title", note.title));
            continue;
         }

         // Buscar en aliases
         const aliasMatch = this.searchInAliases(note, context.normalizedTerm);
         if (aliasMatch) {
            results.push(this.createSearchResult(note, "alias", aliasMatch));
         }
      }

      return results;
   }

   // Búsqueda jerárquica: encuentra notas dentro de una ruta específica
   private performHierarchicalSearch(context: SearchContext): SearchResult[] {
      const results: SearchResult[] = [];
      const allNotes = noteQueryController.getAllNotes() || [];

      for (const note of allNotes) {
         const notePath = this.getNormalizedNotePath(note.id);

         // Verificar si la nota está en la ruta correcta
         if (!this.isNoteInTargetPath(notePath, context)) {
            continue;
         }

         // Para búsqueda exacta de directorio, agregar todas las notas en esa ruta
         if (context.isExactPath) {
            results.push(this.createSearchResult(note, "title", note.title));
            continue;
         }

         // Buscar en título
         const titleMatch = this.searchInText(
            note.title,
            context.searchFragment,
         );
         if (titleMatch) {
            results.push(this.createSearchResult(note, "title", note.title));
            continue;
         }

         // Buscar en aliases
         const aliasMatch = this.searchInAliases(note, context.searchFragment);
         if (aliasMatch) {
            results.push(this.createSearchResult(note, "alias", aliasMatch));
         }
      }

      return results;
   }

   // Verificar si una nota está en la ruta objetivo
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

   // Buscar término en texto normalizado
   private searchInText(text: string, searchTerm: string): boolean {
      return normalizeText(text).includes(searchTerm);
   }

   // Buscar en aliases de una nota
   private searchInAliases(note: any, searchTerm: string): string | null {
      const aliases = note.metadata?.aliases || [];

      for (const alias of aliases) {
         if (this.searchInText(alias, searchTerm)) {
            return alias;
         }
      }

      return null;
   }

   // Obtener ruta normalizada de una nota
   private getNormalizedNotePath(noteId: string): string {
      return normalizeText(noteQueryController.getPathAsString(noteId));
   }

   // Crear resultado de búsqueda
   private createSearchResult(
      note: any,
      matchType: "title" | "alias",
      matchedText: string,
   ): SearchResult {
      return {
         note,
         matchType,
         matchedText,
         path: noteQueryController.getPathAsString(note.id),
      };
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

   // Aplicar límite a los resultados
   private limitResults(
      results: SearchResult[],
      limit: number,
   ): SearchResult[] {
      if (limit === -1) return results;
      if (limit <= 0) return [];
      return results.slice(0, limit);
   }
}

export const searchController = $state(new SearchController());
