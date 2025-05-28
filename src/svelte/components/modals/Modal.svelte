<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import Button from "@components/utils/Button.svelte";
import { XIcon } from "lucide-svelte";
import { floatingMenuController } from "@controllers/floatingMenuController.svelte";
import { onPressEsc } from "@directives/onPressEsc";

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
   <button
      class="absolute top-0 right-0 bottom-0 left-0 z-30 flex bg-black/30 backdrop-blur-xs"
      onclick={closeModal}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
         use:onPressEsc={{
            action: closeModal,
         }}
         class="rounded-selector bg-base-200 bordered relative m-auto min-h-2/3 w-3xl p-6 shadow-xl"
         onclick={(event) => {
            event.stopPropagation();
         }}
         role="dialog"
         aria-modal="true"
         tabindex="-1">
         <Button
            class="absolute top-0 right-0"
            title="Close modal"
            onclick={closeModal}>
            <XIcon />
         </Button>
         {@render content()}
      </div>
   </button>
{/if}
