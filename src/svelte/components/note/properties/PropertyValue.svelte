<script lang="ts">
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

import type { Property } from "@projectTypes/propertyTypes";
import type { Note } from "@projectTypes/noteTypes";

import PropertyText from "./propertyTypes/PropertyText.svelte";
import PropertyList from "./propertyTypes/PropertyList.svelte";
import PropertyNumber from "./propertyTypes/PropertyNumber.svelte";
import PropertyCheck from "./propertyTypes/PropertyCheck.svelte";
import PropertyDate from "./propertyTypes/PropertyDate.svelte";
import PropertyDatetime from "./propertyTypes/PropertyDateTime.svelte";

let { noteId, property }: { noteId: Note["id"]; property: Property } = $props();

function handlePropertyUpdateValue(newValue: Property["value"]) {
   notePropertyController.updateNotePropertyValue(
      noteId,
      property.id,
      newValue,
   );
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
