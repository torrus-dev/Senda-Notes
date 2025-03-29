<script>
import { SettingsIcon, InfoIcon, StarIcon, Trash2Icon } from "lucide-svelte";
import { workspace } from "../../../../controllers/workspaceController.svelte";

import NoteTreeRenderer from "../../noteTreeDnd/NoteTreeRenderer.svelte";
import SettingsModal from "../../modals/SettingsModal.svelte";
import AboutModal from "../../modals/AboutModal.svelte";
import Button from "../../utils/Button.svelte";
import ResizableHandler from "./ResizableHandler.svelte";
import SidebarHeader from "./SidebarHeader.svelte";

import { useResponsive } from "../../../../directives/useResponsive.svelte";

let width = $state(workspace.getSidebarWidth());
let isMobile = $derived(useResponsive().isMobile);
let isSidebarOpen = $derived(workspace.isSidebarOpen());
let isResizing = $state(false);

function updateWidth(newWidth) {
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
   class="relative h-screen w-0 overflow-clip bg-(--color-base-200) shadow-xl
  {!isResizing ? 'transition-all duration-300' : ''}"
   style={isSidebarOpen ? `width: ${widthStyle};` : ""}>
   <SidebarHeader />

   <!-- Controlador de redimensión (deshabilitado en móviles) -->
   <ResizableHandler
      disabled={isMobile}
      updateWidth={updateWidth}
      onResizeStart={handleResizeStart}
      onResizeEnd={handleResizeEnd} />

   <!-- Contenido principal -->
   <div class="overflow-auto">
      <NoteTreeRenderer />
   </div>
   <div>
      <!-- notas en favoritos y en papelera  -->
      <ul class="my-4 flex w-full flex-col p-2" cl>
         <li class="w-full">
            <Button cssClass="w-full">
               <StarIcon size="1.125em"></StarIcon>Favoritos
            </Button>
         </li>
         <li>
            <Button cssClass="w-full">
               <Trash2Icon size="1.125em"></Trash2Icon>Papelera
            </Button>
         </li>
      </ul>
   </div>

   <!-- Footer -->
   <div>
      <ul
         class="text-base-content/70 border-border-normal bg-base-200 absolute bottom-0 left-0 flex w-full gap-0.5 border-t-2 p-2">
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
</aside>
