<script lang="ts">
import { ChevronRightIcon, FileCogIcon } from "lucide-svelte";
import type { NoteMetadata } from "@projectTypes/noteTypes";
import Button from "@components/utils/Button.svelte";
import Collapsible from "@components/utils/Collapsible.svelte";

let { noteId, metadata }: { noteId: string; metadata: NoteMetadata } = $props();
let isExpanded = $state(false);
</script>

{#snippet headingContent()}
   <FileCogIcon /> Metadata
{/snippet}

{#if noteId && metadata}
   <Collapsible headingContent={headingContent}>PRUEBAAAA</Collapsible>

   <!-- <details>
      <summary class="flex items-center justify-between">
         <div class="flex items-center gap-2 text-xl font-bold">
            <ChevronRightIcon size="1.0625rem" /><FileCogIcon size="1.125em" /> Metadata
         </div>
      </summary>
      <div class="bg-base-200 rounded-field px-4 py-2.5">
         <ul class="text-base-content/70 w-full gap-2">
            <li>
               # {noteId}
            </li>
            <li>
               Created: {metadata.created.toFormat("yyyy-MM-dd HH:mm")}
            </li>
            <li>
               Modified: {metadata.modified.toFormat("yyyy-MM-dd HH:mm")}
            </li>
         </ul>
      </div>
   </details> -->

   <!-- <header class="mb-2">Metadata:</header>
   <div class="bg-base-200 rounded-field px-4 py-2.5">
      <ul class="text-base-content/70 w-full gap-2">
         <li>
            # {noteId}
         </li>
         <li>
            Created: {metadata.created.toFormat("yyyy-MM-dd HH:mm")}
         </li>
         <li>
            Modified: {metadata.modified.toFormat("yyyy-MM-dd HH:mm")}
         </li>
      </ul>
   </div> -->
{/if}
