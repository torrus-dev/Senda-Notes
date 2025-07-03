<style>
</style>

<script lang="ts">
import { noteController } from "@controllers/notes/noteController.svelte";
import type { SearchResult } from "@projectTypes/ui/uiTypes";
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
   select: (result: SearchResult) => void;
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
               // Opcional: cerrar el modal de búsqueda o limpiar
               // closeSearchModal();
               // IMPORTANTE: Falta mostrar la nota que acabamos de crear en la pestaña activa
            }
         }
         return; // Importante: salir aquí para evitar que se ejecuten otras condiciones
      }

      // Caso 2: Hay resultados y uno seleccionado
      if (selectedIndex >= 0 && searchResults.length > 0) {
         select(searchResults[selectedIndex]);
         return;
      }

      // Caso 3: No hay resultados - crear nota con el valor de búsqueda
      if (searchValue !== "" && searchResults.length === 0) {
         const noteId = noteController.createNoteFromPath(searchValue);
         if (noteId) {
            // Opcional: cerrar el modal de búsqueda o limpiar
            // closeSearchModal();
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

   // Para búsquedas jerárquicas, solo usamos la parte después de la última /
   const searchTerm = query.includes("/")
      ? query.substring(query.lastIndexOf("/") + 1)
      : query;

   if (!searchTerm) return text;

   try {
      const regex = new RegExp(
         `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
         "gi",
      );
      return text.replace(
         regex,
         '<span class="bg-accent text-accent-content">$1</span>',
      );
   } catch {
      return text;
   }
}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
   class="bg-base-100 rounded-box border-base-300 absolute top-full left-0 z-100 mt-2 max-h-[calc(95vh-3.5rem)] w-full overflow-y-auto border shadow-xl">
   {#if searchResults.length > 0}
      <div
         class="text-muted-content border-base-300 bg-base-100 sticky top-0 border-b px-4 py-1.5 text-sm">
         Resultados: {searchResults.length}
      </div>
      <ul class="scroll-auto p-0">
         {#each searchResults as result, index}
            <li
               bind:this={resultElements[index]}
               class="search-result-item
               {selectedIndex === index ? 'bg-base-200' : ''}">
               <button
                  class="hover:bg-base-200 flex w-full cursor-pointer flex-col items-start p-2 transition-colors"
                  onclick={() => select(result)}
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
                           class="mb-1 overflow-hidden font-medium text-ellipsis whitespace-nowrap">
                           {@html highlightMatch(
                              result.matchedText,
                              searchValue,
                           )}
                        </div>
                        <!-- Ruta del documento -->
                        <div
                           class="text-faint-content overflow-hidden text-sm text-ellipsis whitespace-nowrap">
                           {result.path}
                        </div>
                     </div>
                     {#if result.matchType === "alias"}
                        <span class="badge badge-sm badge-outline">alias</span>
                     {/if}
                  </div>
               </button>
            </li>
         {/each}
      </ul>
   {:else}
      <div class="px-6 pt-6 pb-8 text-center">
         {#if searchValue !== ""}
            <p class="mb-3 text-lg font-bold">
               No se han encontrado resultados
            </p>
            <p class="text-muted-content">
               No hay coincidencias para "{searchValue}"
            </p>
         {:else}
            <p class="mb-3 text-lg font-bold">
               Comienza a escribir para buscar
            </p>
            <p class="text-muted-content">La busqueda esta vacia</p>
         {/if}
      </div>
   {/if}
   <div class="flex justify-center gap-8 p-2 text-xs">
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
</div>
