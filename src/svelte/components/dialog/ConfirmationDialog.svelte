<style>
</style>

<!-- ConfirmationDialog.svelte -->
<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { globalConfirmationDialog } from "modal/ui/confirmationDialogModal.svelte";

let confirmationState = $derived(globalConfirmationDialog.getDialogState());
</script>

{#if confirmationState.isOpen}
   <div class="absolute top-0 right-0 bottom-0 left-0 z-40 flex">
      <div class="bg-base-100 bordered rounded-box m-auto p-4 shadow-xl">
         {#if confirmationState.title}
            <h3 class="mb-5 text-xl font-bold">{confirmationState.title}</h3>
         {/if}
         <p class="mb-5">
            {confirmationState.message}
         </p>
         <div>
            <Button
               onclick={(event) => {
                  globalConfirmationDialog.close();
                  event.stopPropagation();
               }}
               class="bordered">
               Cancelar
            </Button>
            <Button
               onclick={(event) => {
                  globalConfirmationDialog.accept();
                  event.stopPropagation();
               }}
               class="bordered">
               Aceptar
            </Button>
         </div>
      </div>
   </div>
{/if}
