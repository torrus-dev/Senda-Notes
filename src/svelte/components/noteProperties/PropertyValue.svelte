<script lang="ts">
import { notePropertyController } from "@controllers/property/notePropertyController.svelte";

import type { NoteProperty } from "@domain/entities/NoteProperty";
import type { Note } from "@projectTypes/core/noteTypes";

import PropertyText from "@components/noteProperties/propTypes/PropertyText.svelte";
import PropertyList from "@components/noteProperties/propTypes/PropertyList.svelte";
import PropertyNumber from "@components/noteProperties/propTypes/PropertyNumber.svelte";
import PropertyCheck from "@components/noteProperties/propTypes/PropertyCheck.svelte";
import PropertyDate from "@components/noteProperties/propTypes/PropertyDate.svelte";
import PropertyDatetime from "@components/noteProperties/propTypes/PropertyDateTime.svelte";

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
