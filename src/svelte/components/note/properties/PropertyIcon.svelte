<script lang="ts">
import { getPropertyIcon } from "@utils/propertyUtils";
import type { Property } from "@projectTypes/propertyTypes";

let { propertyType = "text" }: { propertyType?: Property["type"] } = $props();

// Obtener el componente de icono actual (derivado)
const IconComponent = $derived(getPropertyIcon(propertyType));
</script>

{#if IconComponent}
   <span>
      <IconComponent size="1.0625em" />
   </span>
{/if}
