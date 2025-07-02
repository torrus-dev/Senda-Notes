<style>
</style>

<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { settingsController } from "@controllers/application/settingsController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-svelte";

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
let shouldShow = $derived(
   workspaceController.tabs.length > 1 || settingsController.permanentTabBar,
);
</script>

{#if shouldShow}
   <div class=" flex w-full items-center px-1">
      <!-- Pestañas -->
      <ul class="flex flex-1 items-center gap-1">
         {#each workspaceController.tabs as tab, index (tab)}
            {@const isActive =
               workspaceController.getActiveTab()?.id === tab.id}
            <!-- Vertical separator -->
            {#if index > 0}
               <div class="bg-base-300 h-8 w-1 self-center"></div>
            {/if}
            <li class="w-full">
               <Button
                  onclick={() => handleTabClick(tab.id)}
                  class="
                  {isActive ? 'bg-base-300' : ''} 
                  hover:bg-base-300 group w-full min-w-6
                  "
                  size="small"
                  aria-selected={isActive}>
                  <!-- Título de la pestaña -->
                  <span class="flex-1 truncate text-sm">
                     {#if tab.noteReference?.noteId}
                        {truncateText(getNoteTitle(tab.noteReference?.noteId))}
                     {:else}
                        Nueva Pestaña
                     {/if}
                  </span>

                  <!-- Botón de cerrar -->
                  <Button
                     class="opacity-0 transition-all group-hover:opacity-100 
                     {isActive ? 'opacity-100' : ''}"
                     size="small"
                     onclick={(event: MouseEvent) =>
                        handleCloseTab(event, tab.id)}
                     aria-label="Cerrar pestaña">
                     <XIcon size="1.125em" />
                  </Button>
               </Button>
            </li>
         {/each}
      </ul>
      <Button
         onclick={() => {
            handleNewTab();
         }}>
         <PlusIcon size="1.125em" />
      </Button>

      <Button>
         <ChevronDownIcon size="1.125em" />
      </Button>
   </div>
{/if}
