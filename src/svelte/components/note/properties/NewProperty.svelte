<script lang="ts">
import PropertyIcon from "@components/note/properties//PropertyIcon.svelte";
import type { Note } from "@projectTypes/noteTypes";
import PropertyNameInput from "@components/note/properties/PropertyNameInput.svelte";

let { noteId }: { noteId: Note["id"] } = $props();

function handlePropertyRename() {}
function handleSelectGlobalProperty() {}
</script>

<div class="grid grid-cols-[12rem_auto] gap-0.5">
   <PropertyIcon propertyType={"text"} />
   <PropertyNameInput
      onchange={handlePropertyRename}
      onSelectGlobalProperty={handleSelectGlobalProperty} />
   noteId={noteId}
</div>
