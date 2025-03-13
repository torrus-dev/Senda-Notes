<script>
import { SettingsIcon, InfoIcon, FilesIcon } from "lucide-svelte";
import { workspace } from "../../../controllers/workspaceController.svelte";

import NoteTreeRenderer from "../../noteTreeDnd/NoteTreeRenderer.svelte";
import SettingsModal from "../../modals/SettingsModal.svelte";
import AboutModal from "../../modals/AboutModal.svelte";
import Button from "../../utils/Button.svelte";
import ResizableHandler from "./ResizableHandler.svelte";

import { useResponsive } from "../../../../directives/useResponsive.svelte";
import { dropdownMenu } from "../../../../directives/contextMenu.svelte";

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
let widthStyle = $derived(isMobile ? "90%" : `${width}rem`);
</script>

<aside
  class="relative w-0 overflow-clip bg-(--color-base-200) shadow {!isResizing
    ? 'transition-all duration-300'
    : ''}"
  style={isSidebarOpen ? `width: ${widthStyle};` : ""}>
  <!-- Header -->
  <nav
    class="border-border-normal flex h-14 w-full items-center justify-between gap-4 p-2 shadow">
    <div class="flex gap-1">
      <Button>
        <FilesIcon size="20" />
      </Button>
    </div>
  </nav>

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

  <!-- Footer -->
  <div>
    <ul
      class="text-base-content/70 border-border-normal bg-base-200 absolute bottom-0 left-0 flex w-full gap-0.5 border-t-2 p-2">
      <li>
        <Button
          onclick={() => {
            workspace.openModal(SettingsModal);
          }}>
          <SettingsIcon></SettingsIcon>
        </Button>
      </li>
      <li>
        <Button
          onclick={() => {
            workspace.openModal(AboutModal);
          }}>
          <InfoIcon></InfoIcon>
        </Button>
      </li>
    </ul>
  </div>
</aside>
