<script lang="ts">
import type { DateTimeProperty } from "@projectTypes/core/propertyTypes";

let {
   property,
   onUpdate,
}: {
   property: DateTimeProperty;
   onUpdate: (newValue: any) => void;
} = $props();

let newValue: DateTimeProperty["value"] = $state(property.value);
</script>

<input
   name={property.name}
   type="datetime-local"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   class="bg-interactive rounded-field px-2 focus:outline-none" />
