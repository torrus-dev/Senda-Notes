<script lang="ts">
import type { DateProperty } from "@projectTypes/core/propertyTypes";

let {
   property,
   onUpdate,
}: {
   property: DateProperty;
   onUpdate: (newValue: any) => void;
} = $props();

let newValue: DateProperty["value"] = $state(property.value);
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
