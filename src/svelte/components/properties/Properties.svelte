<style>
</style>

<script>
import Property from "./Property.svelte";
import PropertyEditor from "./PropertyEditor.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";

import { PlusIcon } from "lucide-svelte";
import Button from "../Button.svelte";

let { note } = $props();
</script>

{#if note}
  <div class="custom-properties my-6">
    <h3 class="py-1 text-xl font-bold">Properties</h3>
    {#if note.properties && note.properties.length > 0}
      <ul class="mb-2 rounded-lg">
        {#each note.properties as property, index (property.id)}
          <Property noteId={note.id} property={property} position={index} />
        {/each}
      </ul>
    {/if}

    <Button cssClass="ml-[-.5rem] mt-2" onclick="">
      <PlusIcon size="18" />Add Property
    </Button>

    {#if workspace.state.propertyEditor.isVisible && workspace.state.propertyEditor.targetNoteId === note.id}
      <div class="relative">
        <PropertyEditor
          position={editorPosition}
          noteId={note.id}
          property={workspace.state.propertyEditor.editingProperty} />
      </div>
    {/if}
  </div>
{/if}
