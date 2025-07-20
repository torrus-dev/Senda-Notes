<script lang="ts">
import type { DatetimeProperty } from "@domain/entities/NoteProperty";

let {
   property,
   onUpdate,
}: {
   property: DatetimeProperty;
   onUpdate: (newValue: any) => void;
} = $props();

let newValue: DatetimeProperty["value"] = $state(property.value);
</script>

<input
   name={property.name}
   type="datetime-local"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   class="bg-interactive rounded-field px-2 focus:outline-none" />
