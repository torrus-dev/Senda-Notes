<script lang="ts">
import type { NoteProperty } from "@domain/entities/NoteProperty";
import { DateTime } from "luxon";

let {
   property,
   onUpdate,
}: {
   property: NoteProperty;
   onUpdate: (newValue: DateTime) => void;
} = $props();

let newValue = $state(property.value as DateTime);
</script>

<input
   name={property.name}
   type="datetime-local"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   class="bg-interactive rounded-field px-2 focus:outline-none" />
