<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: {
   property: NoteProperty;
   onUpdate: (newValue: Date) => void;
} = $props();

let newValue = $state(property.value as Date);
</script>

<input
   name={property.name}
   type="date"
   bind:value={newValue}
   onchange={() => {
      const fechaDateTime = newValue;
      onUpdate(fechaDateTime);
   }}
   class="bg-interactive rounded-field px-2 focus:outline-none" />
