<script lang="ts">
import { bootstrapManager } from "../bootstrap/bootstrapManager.svelte";

</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
   <div class="mx-auto max-w-md px-6 text-center">

      {#if !bootstrapManager.isReady}
         <!-- Estado de carga -->
         <p class="mb-6 text-gray-400">{bootstrapManager.currentStep}</p>

         <!-- Spinner -->
         <div class="mt-6">
            <div
               class="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500">
            </div>
         </div>
      {/if}
   </div>
</div>
