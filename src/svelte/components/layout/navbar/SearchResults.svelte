<style>
.search-result-item:last-child {
   border-bottom: none;
}
</style>

<script lang="ts">
import type { SearchResult } from "@controllers/searchController.svelte";
import { FileIcon } from "lucide-svelte";
import { createEventDispatcher, tick } from "svelte";

// Props
const { results = [], searchValue = "" } = $props<{
   results: SearchResult[];
   searchValue: string;
}>();

// Estado
let selectedIndex = $state(-1);
let resultElements: HTMLElement[] = $state(Array(results.length).fill(null));

// Event dispatcher para comunicar selecciones al componente padre
const dispatch = createEventDispatcher<{
   select: SearchResult;
   navigate: { direction: "up" | "down" };
}>();

// Función para manejar la navegación por teclado
function handleKeyDown(event: KeyboardEvent) {
   const key = event.key;

   if (results.length === 0) return;

   if (key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
      scrollSelectedIntoView();
      dispatch("navigate", { direction: "down" });
   } else if (key === "ArrowUp") {
      event.preventDefault();
      selectedIndex =
         selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
      scrollSelectedIntoView();
      dispatch("navigate", { direction: "up" });
   } else if (key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();
      selectResult(results[selectedIndex]);
   }
}

// Función para seleccionar un resultado
function selectResult(result: SearchResult) {
   dispatch("select", result);
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
   if (results) {
      selectedIndex = results.length > 0 ? 0 : -1;
      resultElements = Array(results.length).fill(null);
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

<svelte:window on:keydown={handleKeyDown} />

<div
   class="bg-base-100 rounded-box border-base-300 absolute top-full left-0 z-100 mt-2 max-h-96 w-full overflow-y-auto border shadow-xl">
   {#if results.length > 0}
      <ul class="p-0">
         {#each results as result, index}
            <li
               bind:this={resultElements[index]}
               class="search-result-item
               {selectedIndex === index ? 'bg-base-200' : ''}">
               <button
                  class="hover:bg-base-200 flex w-full cursor-pointer flex-col items-start p-2 transition-colors"
                  onclick={() => selectResult(result)}
                  onmouseenter={() => {
                     selectedIndex = index;
                  }}>
                  <div class="flex w-full items-center gap-3">
                     <div class="p-2">
                        {#if result.note.icon}
                           <result.note.icon size="1.125em" />
                        {:else}
                           <FileIcon size="1.125em" />
                        {/if}
                     </div>
                     <div class="flex-1 overflow-hidden text-left">
                        <!-- Título con destacado -->
                        <div
                           class="overflow-hidden font-medium text-ellipsis whitespace-nowrap">
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
         <p class="mb-3 text-lg font-bold">No se han encontrado resultados</p>
         <p class="text-muted-content">
            No hay coincidencias para "{searchValue}"
         </p>
      </div>
   {/if}
</div>
