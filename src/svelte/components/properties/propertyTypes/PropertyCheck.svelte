<script lang="ts">
import type { Property } from "@projectTypes/noteTypes";

let {
   property,
   onUpdate,
}: { property: Property; onUpdate: (newValue: any) => void } = $props();
let newValue: any = $state(property.value);
</script>

<input
   name={property.name}
   type="checkbox"
   bind:checked={newValue}
   onchange={() => onUpdate(newValue)}
   class="w-5" />
