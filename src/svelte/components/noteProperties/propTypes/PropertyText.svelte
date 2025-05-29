<script lang="ts">
import type { TextProperty } from "@projectTypes/propertyTypes";
let {
   property,
   onUpdate,
}: {
   property: TextProperty;
   onUpdate: (newValue: any) => void;
} = $props();
let newValue: TextProperty["value"] = $state(property.value);
</script>

<input
   name={property.name}
   type="text"
   bind:value={newValue}
   onchange={() => onUpdate(newValue)}
   placeholder="No value"
   class="bg-interactive rounded-field w-full p-2 focus:outline-none" />
