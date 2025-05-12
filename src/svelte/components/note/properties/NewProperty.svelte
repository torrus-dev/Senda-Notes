<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import PropertyValue from "@components/note/properties/PropertyValue.svelte";
import PropertyLabel from "@components/note/properties/PropertyLabel.svelte";

let { noteId }: { noteId: Note["id"] } = $props();
</script>

<div class="grid grid-cols-[12rem_auto] gap-0.5">
   <PropertyLabel
      noteId={noteId}
      property={property}
      handleDragStart={handleDragStart}
      handleDragEnd={handleDragEnd} />
   <PropertyValue noteId={noteId} property={property} />
</div>
