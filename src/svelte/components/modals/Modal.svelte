<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { onOutsideOrEsc } from "@directives/onOutsideOrEsc";
import Button from "@components/utils/Button.svelte";
import { XIcon } from "lucide-svelte";
import { floatingMenuController } from "@controllers/floatingMenuController.svelte";

let isOpen = $derived(workspace.isModalOpen());
let content = $derived(workspace.getModalContent());

function closeModal() {
   // Si esta abierto el menu flotante no cerramos el modal
   if (!floatingMenuController.getMenuState().isOpen) {
      workspace.closeModal();
   }
}
</script>

{#if isOpen}
   <div
      class="absolute top-0 right-0 bottom-0 left-0 z-30 flex bg-black/30 backdrop-blur-xs">
      <div
         class="rounded-selector bg-base-200 bordered relative m-auto min-h-2/3 w-3xl p-6 shadow-xl"
         use:onOutsideOrEsc={{
            action: closeModal,
         }}
         role="dialog">
         <Button
            class="absolute top-0 right-0"
            title="Close modal"
            onclick={closeModal}>
            <XIcon />
         </Button>
         {@render content()}
      </div>
   </div>
{/if}
