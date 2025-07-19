<script lang="ts">
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
</script>

<div class="bg-base-100 fixed inset-0 z-50 flex items-center justify-center">
   <div class="mx-auto max-w-md px-6 text-center">
      {#if !startupManager.isReady}
         <!-- Estado de carga -->
         <p class="text-base-content mb-6">{startupManager.currentStep}</p>

         <!-- Spinner -->
         <div class="mt-6">
            <div
               class="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500">
            </div>
         </div>
      {/if}
   </div>
</div>
