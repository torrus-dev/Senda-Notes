<style>
</style>

<script lang="ts">
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { MoreVerticalIcon, PlusIcon, XIcon } from "lucide-svelte";

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
function handleTabClick(tabId: string) {
   workspaceController.activateTabByTabId(tabId);
}

// Handler para crear nueva pestaña vacia
function handleNewTab() {
   workspaceController.newEmptyTab();
}

// Handler para cerrar pestaña
function handleCloseTab(event: MouseEvent, tabId: string) {
   event.stopPropagation();
   workspaceController.closeTabByTabId(tabId);
}

// Solo mostrar si hay más de una pestaña
let shouldShow = $derived(workspaceController.tabs.length > 1);
</script>

{#if shouldShow}
   <div
      class="bg-base-200 border-base-300 flex h-10 w-full items-center border-b px-4">
      <!-- Pestañas -->
      <div class="flex flex-1 items-center gap-1">
         {#each workspaceController.tabs as tab, index (tab)}
            {@const isActive =
               workspaceController.getActiveTab()?.id === tab.id}
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
               onclick={() => handleTabClick(tab.id)}
               onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                     e.preventDefault();
                     handleTabClick(tab.id);
                  }
               }}>
               <!-- Título de la pestaña -->
               <span class="min-w-0 flex-1 truncate text-sm">
                  {#if tab.noteReference?.noteId}
                     {truncateText(getNoteTitle(tab.noteReference?.noteId))}
                  {:else}
                     Nueva Pestaña
                  {/if}
               </span>

               <!-- Botón de cerrar -->
               <button
                  class="text-base-content/60 hover:text-base-content hover:bg-base-300 ml-2 flex h-4 w-4 items-center justify-center rounded-sm opacity-0 transition-all group-hover:opacity-100
                  {isActive ? 'opacity-100' : ''}"
                  aria-label="Cerrar pestaña"
                  onclick={(event) => handleCloseTab(event, tab.id)}>
                  <XIcon />
               </button>
            </div>
         {/each}
      </div>
      <div
         onclick={() => {
            handleNewTab();
         }}>
         <PlusIcon />
      </div>

      <!-- Botón de overflow (sin funcionalidad por ahora) -->
      <div class="ml-2 flex items-center">
         <button
            class="text-base-content/60 hover:text-base-content hover:bg-base-300 flex h-6 w-6 items-center justify-center rounded-sm transition-colors"
            aria-label="Más opciones"
            disabled>
            <MoreVerticalIcon />
         </button>
      </div>
   </div>
{/if}
