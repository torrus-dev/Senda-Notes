<script lang="ts">
import { propertyController } from "@controllers/propertyController.svelte";

import type { Property } from "@projectTypes/propertyTypes";

import PropertyText from "./PropertyText.svelte";
import PropertyList from "./PropertyList.svelte";
import PropertyNumber from "./PropertyNumber.svelte";
import PropertyCheck from "./PropertyCheck.svelte";
import PropertyDate from "./PropertyDate.svelte";
import PropertyDatetime from "./PropertyDateTime.svelte";

const components = {
   text: PropertyText,
   list: PropertyList,
   number: PropertyNumber,
   check: PropertyCheck,
   date: PropertyDate,
   datetime: PropertyDatetime,
};

let { property, noteId }: { property: Property; noteId: string } = $props();

function handlePropertyUpdateValue(newValue: Property["value"]) {
   if (!noteId) return;
   propertyController.updateProperty(noteId, property.id, { value: newValue });
}

let PropertyComponent = $derived(components[property.type]);
</script>

<PropertyComponent property={property} onUpdate={handlePropertyUpdateValue}
></PropertyComponent>
