<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { XIcon } from "lucide-svelte";
import { floatingMenuController } from "@controllers/menu/FloatingMenuController.svelte";
import { onPressEsc } from "@directives/onPressEsc";
import { modalController } from "@controllers/menu/ModalController.svelte";

let isOpen = $derived(modalController.isOpen);
let content = $derived(modalController.content);
let title = $derived(modalController.title);

function closeModal() {
   // Si esta abierto el menu flotante no cerramos el modal
   if (!floatingMenuController.getMenuState().isOpen) {
      modalController.close();
   }
}
</script>

{#if isOpen}
   <!-- close overlay -->
   <div
      class="absolute top-0 right-0 bottom-0 left-0 z-30 flex bg-black/30 backdrop-blur-xs"
      onclick={closeModal}
      onkeydown={(e) => {
         if (e.key === "Enter" || e.key === " ") {
            closeModal();
         }
      }}
      role="button"
      tabindex="0"
      aria-label="Close modal overlay">
      <!-- modal -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
         use:onPressEsc={{
            action: closeModal,
         }}
         class="rounded-selector bg-base-200 bordered relative m-auto flex h-2/3 w-3xl flex-col shadow-xl"
         onclick={(event) => {
            event.stopPropagation();
         }}
         role="dialog"
         aria-modal="true"
         tabindex="-1">
         <header>
            <h2 class="mb-3 px-3 py-2 text-center text-xl font-bold">
               {title}
            </h2>
            <Button
               class="absolute top-0 right-0"
               title="Close modal"
               onclick={closeModal}>
               <XIcon />
            </Button>
         </header>
         <div class="overflow-y-auto px-6">
            {@render content()}
         </div>
      </div>
   </div>
{/if}
