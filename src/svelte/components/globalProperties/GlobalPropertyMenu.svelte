<script lang="ts">
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import GlobalPropertyItem from "./GlobalPropertyItem.svelte";

const globalProperties = $derived(
   globalPropertyController.getGlobalProperties(),
);
</script>

<div>
   <h2 class="py-2 text-2xl font-bold">Global Properties:</h2>
   <ul>
      {#each globalProperties as globalProperty}
         <GlobalPropertyItem globalProperty={globalProperty} />
      {/each}
   </ul>
</div>
