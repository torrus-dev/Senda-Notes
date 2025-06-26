<script lang="ts">
import { getPropertyIcon } from "@utils/propertyUtils";
import type { NoteProperty } from "@projectTypes/core/propertyTypes";

let { propertyType = "text" }: { propertyType?: NoteProperty["type"] } =
   $props();

const IconComponent = $derived(getPropertyIcon(propertyType));
</script>

{#if IconComponent}
   <span>
      <IconComponent size="1.0625em" />
   </span>
{/if}
