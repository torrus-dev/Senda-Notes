<script lang="ts">
import type { CheckProperty } from "@projectTypes/propertyTypes";

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
   class="w-5" />
