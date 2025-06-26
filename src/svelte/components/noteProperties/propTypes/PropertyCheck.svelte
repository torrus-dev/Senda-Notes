<script lang="ts">
import type { CheckProperty } from "@projectTypes/core/propertyTypes";

let {
   property,
   onUpdate,
}: { property: CheckProperty; onUpdate: (newValue: any) => void } = $props();
let newValue: CheckProperty["value"] = $state(property.value);
</script>

<input
   name={property.name}
   type="checkbox"
   bind:checked={newValue}
   onchange={() => onUpdate(newValue)}
   class="mx-2 w-5 focus:outline-none" />
