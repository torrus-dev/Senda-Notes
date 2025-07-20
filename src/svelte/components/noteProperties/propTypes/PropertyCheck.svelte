<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: { property: NoteProperty; onUpdate: (newValue: any) => void } = $props();
let newValue = $state(property.value);
</script>

<input
   name={property.name}
   type="checkbox"
   bind:checked={newValue}
   onchange={() => onUpdate(newValue)}
   class="mx-2 w-5 focus:outline-none" />
