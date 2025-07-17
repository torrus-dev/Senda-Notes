<script lang="ts">
import { FileCogIcon } from "lucide-svelte";
import type { NoteMetadata } from "@projectTypes/core/noteTypes";
import Collapsible from "@components/utils/Collapsible.svelte";

let { noteId, metadata }: { noteId: string; metadata: NoteMetadata } = $props();
</script>

{#snippet headingContent()}
   <div class="flex items-center gap-2">
      <FileCogIcon size="1.125rem" /> Metadata
   </div>
{/snippet}

{#if noteId}
   <Collapsible
      id="note-metadata"
      headingContent={headingContent}
      chevronPosition="floating-left">
      <div class="bg-base-200 rounded-field my-2 px-4 py-2.5">
         <ul class="text-muted-content w-full gap-2">
            <li>
               #ID: {noteId}
            </li>
            <li>
               Created: {metadata.created.toFormat("yyyy-MM-dd HH:mm")}
            </li>
            <li>
               Modified: {metadata.modified.toFormat("yyyy-MM-dd HH:mm")}
            </li>
         </ul>
      </div>
   </Collapsible>
{/if}
