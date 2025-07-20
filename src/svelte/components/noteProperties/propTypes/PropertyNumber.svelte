<script lang="ts">
import type { NumberProperty } from "@domain/entities/NoteProperty";

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
   }}
   class="bg-interactive rounded-field px-2 focus:outline-none" />
