<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: { property: NoteProperty; onUpdate: (newValue: boolean) => void } = $props();

// Type assertion - sabemos que es boolean porque este componente solo se usa para check
let newValue = $state(property.value as boolean);
</script>

<input
   name={property.name}
   type="checkbox"
   bind:checked={newValue}
   onchange={() => onUpdate(newValue)}
   class="mx-2 w-5 focus:outline-none" />
