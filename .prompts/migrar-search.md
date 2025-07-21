# Migración de arquitectura - Sistema de Propiedades

## Contexto

Estoy migrando una aplicación tipo Notion local (Svelte + Electron) de una arquitectura compuesta unicamente por controladores + modelos anémicos hacia una arquitectura ligera inspirada en DDD.

La aplicación es un proyecto hobbie, no es algo profesional y es individual, por eso prefiero la simpleza a la complejidad.

Ya he migrado exitosamente el sistema de Notas con esta estructura (tambien te incluyo la ubicación de los controladores relacionados con propiedades)

```
src
   └── application
       └── usecases
           └── NoteUseCases.ts
   └── controllers
       └── notes
           ├── noteController.svelte.ts
           ├── noteQueryController.svelte.ts
       └── property
           ├── globalPropertyController.svelte.ts
           └── notePropertyController.svelte.ts
       └── // demas controladores...
   └── domain
       └── entities
           ├── Note.ts
       └── services
           ├── NotePathService.ts
           └── NoteTreeService.ts
 └── infrastructure
     └── persistence
         ├── JsonFileAdapter.svelte.ts
         └── LocalStorageAdapter.svelte.ts
     └── repositories
         ├── FavoritesRepository.ts
         ├── NoteQueryRepository.ts
         └── NoteRepository.ts
     └── startup
         └── startupManager.svelte.ts
```

He migrado la parte de Notas y Propiedades. Ahora estoy revisando controladores sin persistencia, he llegado a SearchController que centraliza y gestiona el componente NavigationBar.svelte de busqueda que se usa en la aplicación, usa NoteQueryController para cargar datos

Habia pensado en separarlo en SearchController y SearchService extrayendo la lógica compleja y aligerando el controlador.

Aunque de cara a futuro me gustaria:
- Poder añadir filtros a la busqueda por campos de la nota
- Tener otras formas de mostrar una busqueda, ej mostrar los resultados en una pestaña en lugar de este elemento flotante.
  Esto no quiero implementarlo ahora, solo es para que te hagas una idea de hacia donde va a ir este sistema.

El componente no necesita repository, ni useCase

La instancia de los servicios se hace en startupManager.svelte.ts y se puede acceder a los servicios con startupManager.getService("SearchService"), no te preocupes de modificar el startupManager, yo lo registrare para que este disponible de esa forma.


## Intentos previos
He intentado con Claude migrar este controlador pero en varias ocasiones caiamos en varios errores recurrentes. Convirtio la busqueda con searchNotes (metodo actual) a async, esto creo que sear necesario para mas adelante si implemento otros adaptadores como SQLite. El problema era que al intentar adaptar NavigationBar.svelte modificaba y modificaba su $effect entrabamos en un bucle infinito de $effect, añadia debounce save dentro de NavigationBar para no consultar con cada tecleo y no se si era esto lo que lo causaba o simplemente el tener async.


## Código:

SearchController.svelte.ts
```
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

/**
 * Controlador de búsqueda de notas
 * Se enfoca exclusivamente en la lógica de búsqueda y filtrado
 */
class SearchController {
   isSearching: boolean = $state(false);

   // === FUNCIÓN PRINCIPAL DE BÚSQUEDA ===

   searchNotes(searchTerm: string, limit: number = -1): SearchResult[] {
      const context = this.parseSearchTerm(searchTerm);
      if (!context) return [];

      const results = context.isHierarchical
         ? this.performHierarchicalSearch(context)
         : this.performSimpleSearch(context);

      return this.limitResults(this.sortResults(results), limit);
   }

   // === PARSEO DE TÉRMINOS DE BÚSQUEDA ===

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

   // === TIPOS DE BÚSQUEDA ===

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

   // === MÉTODOS AUXILIARES DE BÚSQUEDA ===

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

   private searchInText(text: string, searchTerm: string): boolean {
      return normalizeText(text).includes(searchTerm);
   }

   private searchInAliases(note: any, searchTerm: string): string | null {
      const aliases = note.metadata?.aliases || [];

      for (const alias of aliases) {
         if (this.searchInText(alias, searchTerm)) {
            return alias;
         }
      }

      return null;
   }

   private getNormalizedNotePath(noteId: string): string {
      return normalizeText(noteQueryController.getNotePathAsString(noteId));
   }

   // === CREACIÓN Y ORDENAMIENTO DE RESULTADOS ===

   private createSearchResult(
      note: any,
      matchType: "title" | "alias",
      matchedText: string,
   ): SearchResult {
      return {
         note,
         matchType,
         matchedText,
         path: noteQueryController.getNotePathAsString(note.id),
      };
   }

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

```

Tipos
```typescript
export class Note {
   id: string;
   icon?: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   stats?: NoteStats;
   metadata: NoteMetadata;
   properties: NoteProperty[];

   // Resto de la clase...
}

export interface NoteMetadata {
   created: DateTime;
   modified: DateTime;
   outgoingLinks: NoteReference[];
   incomingLinks: NoteReference[];
   aliases: string[];
}

export interface NoteStats {
   wordCount: number;
   characterCount: number;
   lineCount: number;
   lastCalculated: DateTime;
}

export interface SearchResult {
   note: Note;
   matchType: "title" | "alias" | "content";
   matchedText: string;
   path: string;
}
```

NavigationBar.svelte
```
<script lang="ts">
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { searchController } from "@controllers/navigation/searchController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { onPressEsc } from "@directives/onPressEsc";
import MoreButton from "@components/navbar/MoreButton.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import SearchResults from "@components/navbar/search/SearchResults.svelte";
import Button from "@components/utils/Button.svelte";

import type { Note } from "@projectTypes/core/noteTypes";
import type { SearchResult } from "@projectTypes/ui/uiTypes";

import { tick } from "svelte";
import { DeleteIcon, XIcon } from "lucide-svelte";
import { onClickOutside } from "@directives/onClickOutside";

let { note }: { note: Note | undefined } = $props();

const getNotePath = () =>
   note?.id ? noteQueryController.getNotePathAsString(note?.id) : "";

let searchValue: string = $state("");
let searchElement: HTMLInputElement | undefined = $state(undefined);
let searchResults: SearchResult[] = $state([]);
let isSearching = $derived(searchController.isSearching);

// Buscar cuando cambia el valor de búsqueda
$effect(() => {
   if (isSearching && searchValue.trim()) {
      searchResults = searchController.searchNotes(searchValue);
   } else {
      searchResults = [];
   }
});

// Comenzar o terminar de buscar segun el estado de isSearching en el controlador de busquedas
$effect(() => {
   if (isSearching) {
      searchValue = getNotePath();
      // Esperar a que Svelte renderice el searchElement tras un condicional para enfocarlo
      tick().then(() => {
         if (searchElement) {
            searchElement.focus();
         }
      });
   } else {
      searchValue = "";
      searchResults = [];
   }
});

// Maneja la selección de un resultado
function handleResultSelect(
   event: MouseEvent | KeyboardEvent,
   result: SearchResult,
) {
   if (result.note && result.note.id) {
      // Navegar a la nota seleccionada
      if (!event.ctrlKey) {
         workspaceController.openNote(result.note.id);
      } else {
         workspaceController.openNoteInNewTab(result.note.id);
      }
      searchController.isSearching = false;
   }
}
</script>

<div
   class="bg-base-200 rounded-field relative flex h-10 w-full justify-between
   {isSearching ? 'outline-interactive-accent-focus outline-2' : ''}">
   {#if isSearching}
      <div
         class=" rounded-field flex flex-grow pl-2.5"
         use:onPressEsc={{
            action: () => {
               searchController.isSearching = false;
            },
         }}
         use:onClickOutside={{
            action: () => {
               searchController.isSearching = false;
            },
         }}>
         <input
            type="text"
            class=" w-full py-1.5 focus:outline-none"
            bind:this={searchElement}
            bind:value={searchValue}
            placeholder="Search Notes..." />

         <!-- Componente de resultados de búsqueda -->
         <SearchResults
            searchResults={searchResults}
            searchValue={searchValue}
            select={handleResultSelect} />
         <div class="flex items-center">
            <Button
               title="Delete search"
               onclick={() => {
                  searchValue = "";
                  searchElement?.focus();
               }}>
               <DeleteIcon size="1.25em" />
            </Button>
            <Button
               title="End search"
               onclick={() => {
                  searchController.isSearching = false;
               }}>
               <XIcon size="1.25em" />
            </Button>
         </div>
      </div>
   {:else}
      <div class="rounded-field flex flex-grow items-center">
         {#if note}
            <Breadcrumbs showHome={true} noteId={note.id} />
         {/if}
         <button
            class="flex-grow cursor-text p-2 text-left"
            onclick={() => {
               searchController.isSearching = true;
            }}>
            {#if note}
               {note?.title}
            {:else}
               Inicio
            {/if}
         </button>
         <div class="flex items-center">
            {#if note}
               <MoreButton noteId={note.id} />
            {/if}
         </div>
      </div>
   {/if}
</div>

```

## Propuesta de implementación
SearchService (domain/services):
- Lógica pura de búsqueda (sin $state)
- Métodos síncronos para evitar bucles infinitos
- Recibe noteQueryController como dependencia

SearchController (controllers):
- Solo estado reactivo (isSearching)
- Delega búsquedas a SearchService
- Coordinación mínima con UI

NavigationBar:
- Cambios mínimos en $effect
- Sin debounce por ahora para evitar complejidad