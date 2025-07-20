<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: {
   property: NoteProperty;
   onUpdate: (newValue: number) => void;
} = $props();
let newValue = $state(property.value as number);
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
