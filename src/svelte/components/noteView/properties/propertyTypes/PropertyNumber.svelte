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
   type="number"
   bind:value={newValue}
   onchange={(event: Event) => {
      const value = Number((event.target as HTMLInputElement)?.value);
      if (value && !isNaN(value)) {
         onUpdate(newValue);
      }
   }} />
