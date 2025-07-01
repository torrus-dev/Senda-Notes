<style>
.highlight {
   /* Aquí puedes agregar tus estilos personalizados para la pestaña activa */
   position: relative;
}

.highlight::after {
   content: "";
   position: absolute;
   bottom: 0;
   left: 0;
   right: 0;
   height: 2px;
   background: hsl(var(--p));
}
</style>

<script lang="ts">
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

// Variables para drag & drop
let draggedTabIndex = $state<number | null>(null);
let dragOverIndex = $state<number | null>(null);

// Función para obtener el título de una nota por su ID
function getNoteTitle(noteId: string): string {
   const note = noteQueryController.getNoteById(noteId);
   return note?.title || "Sin título";
}

// Función para truncar texto
function truncateText(text: string, maxLength: number = 20): string {
   return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Handler para activar pestaña
function handleTabClick(noteId: string) {
   workspaceController.activateTab(noteId);
}

// Handler para cerrar pestaña
function handleCloseTab(event: MouseEvent, noteId: string) {
   event.stopPropagation();
   workspaceController.closeTab(noteId);
}

// Solo mostrar si hay más de una pestaña
let shouldShow = $derived(workspaceController.tabs.length > 1);
</script>

{#if shouldShow}
   <div
      class="bg-base-200 border-base-300 flex h-10 w-full items-center border-b px-4">
      <!-- Pestañas -->
      <div class="flex flex-1 items-center gap-1">
         {#each workspaceController.tabs as tabId, index (tabId)}
            {@const isActive = workspaceController.activeNoteId === tabId}
            {@const isDragging = draggedTabIndex === index}
            {@const isDragOver = dragOverIndex === index}

            <div
               class="group hover:bg-base-300 relative flex h-8 max-w-48 min-w-0 flex-1 cursor-pointer items-center rounded-t-md px-3 transition-colors
               {isActive ? 'highlight' : 'bg-base-200'}
               {isDragging ? 'opacity-50' : ''}
               {isDragOver ? 'ring-primary ring-opacity-50 ring-2' : ''}"
               draggable="true"
               role="tab"
               tabindex="0"
               aria-selected={isActive}
               onclick={() => handleTabClick(tabId)}
               onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                     e.preventDefault();
                     handleTabClick(tabId);
                  }
               }}>
               <!-- Título de la pestaña -->
               <span class="min-w-0 flex-1 truncate text-sm">
                  {truncateText(getNoteTitle(tabId))}
               </span>

               <!-- Botón de cerrar -->
               <button
                  class="text-base-content/60 hover:text-base-content hover:bg-base-300 ml-2 flex h-4 w-4 items-center justify-center rounded-sm opacity-0 transition-all group-hover:opacity-100
                  {isActive ? 'opacity-100' : ''}"
                  aria-label="Cerrar pestaña"
                  onclick={(e) => handleCloseTab(e, tabId)}>
                  <svg
                     class="h-3 w-3"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24">
                     <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
         {/each}
      </div>

      <!-- Botón de overflow (sin funcionalidad por ahora) -->
      <div class="ml-2 flex items-center">
         <button
            class="text-base-content/60 hover:text-base-content hover:bg-base-300 flex h-6 w-6 items-center justify-center rounded-sm transition-colors"
            aria-label="Más opciones"
            disabled>
            <svg
               class="h-4 w-4"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24">
               <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
         </button>
      </div>
   </div>
{/if}
