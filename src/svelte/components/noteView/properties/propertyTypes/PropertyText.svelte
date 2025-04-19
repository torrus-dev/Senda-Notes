<script lang="ts">
import type { Property } from "@projectTypes/noteTypes";
let {
   property,
   onUpdate,
}: {
   property: Property;
   onUpdate: (newValue: any) => void;
} = $props();
let newValue = $state(property.value);
</script>

<input
   name={property.name}
   type="text"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   placeholder="No value" />
