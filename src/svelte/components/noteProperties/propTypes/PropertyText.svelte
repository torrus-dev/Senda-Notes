<script lang="ts">
import { NoteProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: {
   property: NoteProperty;
   onUpdate: (newValue: any) => void;
} = $props();
let newValue: NoteProperty["value"] = $state(property.value);
</script>

<input
   name={property.name}
   type="text"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   placeholder="No value"
   class="bg-interactive rounded-field w-full p-2 focus:outline-none" />
