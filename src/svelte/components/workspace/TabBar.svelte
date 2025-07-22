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
   workspaceController.activateTab(tabId);
}

// Handler para crear nueva pestaña vacia
function handleNewTab() {
   workspaceController.createEmptyTab();
}

// Handler para cerrar pestaña
function handleCloseTab(event: MouseEvent, tabId: string) {
   event.stopPropagation();
   workspaceController.closeTab(tabId);
}

// Solo mostrar si hay más de una pestaña
let shouldShow = $derived(
   workspaceController.tabs.length > 1 ||
      settingsController.get("permanentTabBar"),
);
</script>

{#if shouldShow}
   <div class=" flex w-full items-center px-1">
      <!-- Pestañas -->
      <ul class="flex flex-1 items-center gap-1">
         {#each workspaceController.tabs as tab, index (tab)}
            {@const isActive = workspaceController.activeTabId === tab.id}
            <!-- Vertical separator -->
            <!-- {#if index > 0}
               <div class="bg-base-300 h-5 w-0.5 self-center"></div>
            {/if} -->
            <li class="max-w-full min-w-16">
               <Button
                  onclick={() => handleTabClick(tab.id)}
                  class="
                  {isActive ? 'bg-base-300' : ''} 
                  hover:bg-base-300 bg-base-200 group w-full min-w-6 px-0 py-0.75
                  "
                  aria-selected={isActive}>
                  <!-- Título de la pestaña -->
                  <span class="flex-1 truncate px-2 text-sm">
                     {#if tab.noteReference?.noteId}
                        {truncateText(getNoteTitle(tab.noteReference?.noteId))}
                     {:else}
                        Nueva Pestaña
                     {/if}
                  </span>

                  <!-- Botón de cerrar -->
                  <Button
                     class="transition-all group-hover:opacity-100 
                     {isActive ? 'opacity-100' : 'opacity-50'}"
                     size="small"
                     shape="square"
                     onclick={(event: MouseEvent) =>
                        handleCloseTab(event, tab.id)}
                     aria-label="Cerrar pestaña">
                     <XIcon size="1em" />
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
