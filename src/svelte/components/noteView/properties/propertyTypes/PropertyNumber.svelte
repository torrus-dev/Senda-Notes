<script lang="ts">
import type { NumberProperty } from "@projectTypes/propertyTypes";

let {
   property,
   onUpdate,
}: {
   property: NumberProperty;
   onUpdate: (newValue: any) => void;
} = $props();
let newValue: NumberProperty["value"] = $state(property.value);
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
