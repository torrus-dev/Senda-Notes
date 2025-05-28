<style>
</style>

<!-- ConfirmationDialog.svelte -->
<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { globalConfirmationDialog } from "@UIState/ConfirmationDialogState.svelte";

let confirmationState = $derived(globalConfirmationDialog.getDialogState());
</script>

{#if confirmationState.isOpen}
   <div class="absolute top-0 right-0 bottom-0 left-0 z-40 flex">
      <div class="bg-base-100 m-auto p-4 shadow-xl">
         {#if confirmationState.title}
            <h3 class="my-2 text-lg">{confirmationState.title}</h3>
         {/if}
         <p class="my-2">
            {confirmationState.message}
         </p>
         <Button
            onclick={(event) => {
               globalConfirmationDialog.close();
               event.stopPropagation();
            }}>Cancelar</Button>
         <Button
            onclick={(event) => {
               globalConfirmationDialog.accept();
               event.stopPropagation();
            }}>Aceptar</Button>
      </div>
   </div>
{/if}
