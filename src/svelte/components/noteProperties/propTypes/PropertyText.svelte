<script lang="ts">
import { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: {
   property: NoteProperty;
   onUpdate: (newValue: string) => void;
} = $props();
let newValue = $state(property.value as string);
</script>

<input
   name={property.name}
   type="text"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   placeholder="No value"
   class="bg-interactive rounded-field w-full p-2 focus:outline-none" />
