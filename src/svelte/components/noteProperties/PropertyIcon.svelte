<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";
import { getPropertyIcon } from "@utils/propertyUtils";

let { propertyType = "text" }: { propertyType?: NoteProperty["type"] } =
   $props();

const IconComponent = $derived(getPropertyIcon(propertyType));
</script>

{#if IconComponent}
   <span>
      <IconComponent size="1.0625em" />
   </span>
{/if}
