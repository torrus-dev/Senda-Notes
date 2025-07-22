<style>
</style>

<script lang="ts">
import type { SearchResult } from "@projectTypes/ui/uiTypes";
import { searchController } from "@controllers/navigation/SearchController.svelte";
import { noteController } from "@controllers/notes/NoteController.svelte";
import { CornerDownLeft, FileIcon } from "lucide-svelte";
import { tick } from "svelte";

// Props
const {
   searchResults = [],
   searchValue = "",
   select,
}: {
   searchResults: SearchResult[];
   searchValue: string;
   select: (event: MouseEvent | KeyboardEvent, result: SearchResult) => void;
} = $props();

// Estado
let selectedIndex = $state(-1);
let resultElements: HTMLElement[] = $state(
   Array(searchResults.length).fill(null),
);

// Función para manejar la navegación por teclado
function handleKeyDown(event: KeyboardEvent) {
   const key = event.key;

   if (key === "ArrowDown") {
      event.preventDefault();
      if (searchResults.length === 0) return;
      selectedIndex = (selectedIndex + 1) % searchResults.length;
      scrollSelectedIntoView();
   } else if (key === "ArrowUp") {
      event.preventDefault();
      if (searchResults.length === 0) return;
      selectedIndex =
         selectedIndex <= 0 ? searchResults.length - 1 : selectedIndex - 1;
      scrollSelectedIntoView();
   } else if (key === "Enter") {
      event.preventDefault();

      // Caso 1: Shift + Enter - crear nota aunque haya resultados si no coincide exactamente
      if (event.shiftKey && searchValue !== "") {
         const exactMatch = searchResults.some(
            (result) =>
               result.matchType === "title" &&
               result.matchedText.toLowerCase() === searchValue.toLowerCase(),
         );

         if (!exactMatch) {
            const noteId = noteController.createNoteFromPath(searchValue);
            if (noteId) {
               // Cerrar el modal de búsqueda o limpiar
               searchController.isSearching = false;

               // IMPORTANTE: Falta mostrar la nota que acabamos de crear en la pestaña activa
            }
         }
         return; // Importante: salir aquí para evitar que se ejecuten otras condiciones
      }
      // Caso 2: Ctrl + Enter - abrir nota en nueva pestaña
      if (event.ctrlKey) {
         select(event, searchResults[selectedIndex]);
         return;
      }

      // Caso 3: Hay resultados y uno seleccionado
      if (selectedIndex >= 0 && searchResults.length > 0) {
         select(event, searchResults[selectedIndex]);
         return;
      }

      // Caso 4: No hay resultados - crear nota con el valor de búsqueda
      if (searchValue !== "" && searchResults.length === 0) {
         const noteId = noteController.createNoteFromPath(searchValue);
         if (noteId) {
            searchController.isSearching = false;
         }
         return;
      }
   }
}

// Función para asegurar que el elemento seleccionado esté visible
async function scrollSelectedIntoView() {
   await tick();
   if (selectedIndex >= 0 && resultElements[selectedIndex]) {
      resultElements[selectedIndex].scrollIntoView({
         behavior: "smooth",
         block: "nearest",
      });
   }
}

// Reset del índice seleccionado cuando cambian los resultados
$effect(() => {
   if (searchResults) {
      selectedIndex = searchResults.length > 0 ? 0 : -1;
      resultElements = Array(searchResults.length).fill(null);
   }
});

// Función para destacar el texto coincidente
function highlightMatch(text: string, query: string): string {
   if (!query) return text;

   // Extrae el término de búsqueda después del último "/"
   const searchTerm = query.split("/").pop() || "";
   if (!searchTerm) return text;

   try {
      const regex = new RegExp(
         `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
         "gi",
      );
      return text.replace(regex, '<span class="highlight">$1</span>');
   } catch {
      return text;
   }
}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#snippet topContentSearch()}
   <div class="text-muted-content px-4 text-sm">
      Resultados: {searchResults.length}
   </div>
{/snippet}
{#snippet bottomContentSearch()}
   <div class="flex justify-center gap-8 text-sm">
      <p class="flex items-center gap-1">
         <kbd
            class="bg-base-200 rounded-selector flex items-center gap-1 p-0.5">
            <CornerDownLeft size="1.125em" /></kbd> para abrir
      </p>
      <p class="flex items-center gap-1">
         <kbd
            class="bg-base-200 rounded-selector flex items-center gap-1 p-0.5">
            ctrl + <CornerDownLeft size="1.125em" /></kbd> para abrir en nueva pestaña
      </p>
      <p class="flex items-center gap-1">
         <kbd
            class="bg-base-200 rounded-selector flex items-center gap-1 p-0.5">
            shift + <CornerDownLeft size="1.125em" /></kbd> para crear
      </p>
      <p class="flex items-center gap-1">
         <kbd class="bg-base-200 rounded-selector p-0.5">esc</kbd>
         para salir
      </p>
   </div>
{/snippet}

<div
   class="bg-base-100 rounded-box bordered z-100 absolute left-0 top-full mt-2 max-h-[calc(95vh-3.5rem)] w-full shadow-xl">
   <div class="border-base-300 border-b py-1">
      {@render topContentSearch()}
   </div>
   <div class="w-full overflow-y-auto">
      {#if searchResults.length > 0}
         <ul class="scroll-auto p-0">
            {#each searchResults as result, index}
               <li
                  bind:this={resultElements[index]}
                  class="search-result-item
               {selectedIndex === index ? 'bg-base-200' : ''}">
                  <button
                     class="hover:bg-base-200 flex w-full cursor-pointer flex-col items-start p-2 transition-colors"
                     onclick={(event: MouseEvent) => select(event, result)}
                     onmouseenter={() => {
                        selectedIndex = index;
                     }}>
                     <div class="flex w-full items-center gap-3 py-1">
                        <div class="p-2">
                           {#if result.note.icon}
                              <div class="text-lg">
                                 {result.note.icon}
                              </div>
                           {:else}
                              <FileIcon size="1.125em" />
                           {/if}
                        </div>
                        <div class="flex-1 overflow-hidden text-left">
                           <!-- Título con destacado -->
                           <div
                              class="mb-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                              {@html highlightMatch(
                                 result.matchedText,
                                 searchValue,
                              )}
                           </div>
                           <!-- Ruta del documento -->
                           <div
                              class="text-faint-content overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                              {result.path}
                           </div>
                        </div>
                        {#if result.matchType === "alias"}
                           <span class="badge badge-sm badge-outline"
                              >alias</span>
                        {/if}
                     </div>
                  </button>
               </li>
            {/each}
         </ul>
      {:else}
         <div class="px-6 pb-8 pt-6 text-center">
            {#if searchValue !== ""}
               <p class="mb-3 text-lg font-bold">
                  No se han encontrado resultados
               </p>
               <div class="text-muted-content">
                  No hay coincidencias para "{searchValue}"
               </div>
               <div>
                  Pulsa <kbd
                     class="bg-base-200 rounded-selector inline-flex items-center gap-1 p-0.5">
                     <CornerDownLeft size="1.125em" /></kbd> para crear la nota
               </div>
            {:else}
               <p class="mb-3 text-lg font-bold">
                  Comienza a escribir para buscar
               </p>
               <p class="text-muted-content">La busqueda esta vacia</p>
            {/if}
         </div>
      {/if}
      <!-- texto para informar de los controles inferior -->
   </div>
   <div class="text-muted-content border-base-300 border-t py-1">
      {@render bottomContentSearch()}
   </div>
</div>
