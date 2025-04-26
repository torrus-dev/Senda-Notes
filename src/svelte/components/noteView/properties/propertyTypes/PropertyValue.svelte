<script lang="ts">
import { notePropertyController } from "@controllers/notePropertyController.svelte";

import type { Property } from "@projectTypes/propertyTypes";

import PropertyText from "./PropertyText.svelte";
import PropertyList from "./PropertyList.svelte";
import PropertyNumber from "./PropertyNumber.svelte";
import PropertyCheck from "./PropertyCheck.svelte";
import PropertyDate from "./PropertyDate.svelte";
import PropertyDatetime from "./PropertyDateTime.svelte";

let { property }: { property: Property } = $props();

function handlePropertyUpdateValue(newValue: Property["value"]) {
   notePropertyController.updateNotePropertyValue(property.id, newValue);
}
</script>

{#if property.type === "text"}
   <PropertyText property={property} onUpdate={handlePropertyUpdateValue} />
{:else if property.type === "number"}
   <PropertyNumber property={property} onUpdate={handlePropertyUpdateValue} />
{:else if property.type === "list"}
   <PropertyList property={property} onUpdate={handlePropertyUpdateValue} />
{:else if property.type === "check"}
   <PropertyCheck property={property} onUpdate={handlePropertyUpdateValue} />
{:else if property.type === "date"}
   <PropertyDate property={property} onUpdate={handlePropertyUpdateValue} />
{:else if property.type === "datetime"}
   <PropertyDatetime property={property} onUpdate={handlePropertyUpdateValue} />
{/if}
