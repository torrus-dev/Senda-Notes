<script lang="ts">
import { SettingsIcon, InfoIcon, StarIcon, Trash2Icon } from "lucide-svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";

import NoteTreeRenderer from "@components/sidebar/noteTreeDnd/NoteTreeRenderer.svelte";
import SettingsModal from "@components/modals/SettingsModal.svelte";
import AboutModal from "@components/modals/AboutModal.svelte";
import Button from "@components/utils/Button.svelte";
import ResizableHandler from "@components/sidebar/ResizableHandler.svelte";
import Favorites from "@components/sidebar/Favorites.svelte";

let width = $state(workspace.getSidebarWidth());
let isMobile = $derived(screenSizeController.isMobile);
let isSidebarOpen = $derived(
   workspace.isSidebarOpen() || settingsController.getLockSidebar(),
);
let isResizing = $state(false);

function updateWidth(newWidth: number) {
   width = newWidth;
}

function handleResizeStart() {
   isResizing = true;
}

function handleResizeEnd() {
   isResizing = false;
}

// Usar $derived correctamente para calcular el ancho
let widthStyle = $derived(isMobile ? "90%" : `${width}em`);
</script>

<aside
   class="bg-base-200 relative h-screen w-0 overflow-clip shadow-xl
  {!isResizing ? 'transition-all duration-300' : ''}"
   style={isSidebarOpen ? `width: ${widthStyle};` : ""}>
   <ResizableHandler
      disabled={isMobile}
      updateWidth={updateWidth}
      onResizeStart={handleResizeStart}
      onResizeEnd={handleResizeEnd} />
   <div class="flex flex-col gap-6 p-2">
      <NoteTreeRenderer />
      <Favorites />
      <div>
         <!-- notas en favoritos y en papelera  -->
         <ul class="my-4 flex w-full flex-col p-2">
            <li>
               <Button class="w-full">
                  <Trash2Icon size="1.125em"></Trash2Icon>Papelera
               </Button>
            </li>
         </ul>
      </div>

      <!-- Footer -->
      <div>
         <ul
            class="text-muted-content border-border-normal bg-base-200 absolute bottom-0 left-0 flex w-full gap-0.5 border-t-2 p-2">
            <li>
               <Button
                  onclick={() => {
                     workspace.openModal(SettingsModal);
                  }}>
                  <SettingsIcon size="1.5rem"></SettingsIcon>
               </Button>
            </li>
            <li>
               <Button
                  onclick={() => {
                     workspace.openModal(AboutModal);
                  }}>
                  <InfoIcon size="1.5rem"></InfoIcon>
               </Button>
            </li>
         </ul>
      </div>
   </div>
</aside>
