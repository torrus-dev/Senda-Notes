<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import type { MenuItem } from "@projectTypes/ui/contextMenuTypes";
import type { Tab } from "@projectTypes/ui/uiTypes";
import { XIcon } from "lucide-svelte";

// Función para obtener el título de una nota por su ID
function getNoteTitle(noteId: string): string {
   const note = noteQueryController.getNoteById(noteId);
   return note?.title || "Sin título";
}

// Handler para activar pestaña
function handleTabClick(tabId: string) {
   workspaceController.activateTab(tabId);
}

// Handler para cerrar pestaña
function handleCloseTab(event: MouseEvent, tabId: string) {
   event.stopPropagation();
   workspaceController.closeTab(tabId);
}

// Función para truncar texto
function truncateText(text: string, maxLength: number = 20): string {
   return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

let tabMenuItems: MenuItem[] = [
   {
      label: "Close",
      type: "action",
      action: () => {
         workspaceController.closeTab(tab.id);
      },
   },
   {
      label: "Close others",
      type: "action",
      action: () => {
         workspaceController.closeOtherTabs(tab.id);
      },
   },
   {
      label: "Close left tabs",
      type: "action",
      action: () => {
         workspaceController.closeLeftTabs(tab.id);
      },
   },
   {
      label: "Close right tabs",
      type: "action",
      action: () => {
         workspaceController.closeRightTabs(tab.id);
      },
   },
];

let { tab }: { tab: Tab } = $props();

let isActive = $derived(workspaceController.activeTabId === tab.id);
</script>

<li class="max-w-full min-w-16">
   <Button
      dropdownMenuItems={tabMenuItems}
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
         onclick={(event: MouseEvent) => handleCloseTab(event, tab.id)}
         aria-label="Cerrar pestaña">
         <XIcon size="1em" />
      </Button>
   </Button>
</li>
