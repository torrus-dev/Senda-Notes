<script lang="ts">
import { notePropertyController } from "@controllers/note/property/notePropertyController.svelte";

import type { NoteProperty } from "@projectTypes/propertyTypes";
import type { Note } from "@projectTypes/noteTypes";

import PropertyText from "@components/note/properties/propTypes/PropertyText.svelte";
import PropertyList from "@components/note/properties/propTypes/PropertyList.svelte";
import PropertyNumber from "@components/note/properties/propTypes/PropertyNumber.svelte";
import PropertyCheck from "@components/note/properties/propTypes/PropertyCheck.svelte";
import PropertyDate from "@components/note/properties/propTypes/PropertyDate.svelte";
import PropertyDatetime from "@components/note/properties/propTypes/PropertyDateTime.svelte";

let { noteId, property }: { noteId: Note["id"]; property: NoteProperty } =
   $props();

function handlePropertyUpdateValue(newValue: NoteProperty["value"]) {
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
