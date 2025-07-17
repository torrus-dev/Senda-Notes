<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";

import Collapsible from "@components/utils/Collapsible.svelte";
import { favoriteController } from "@controllers/notes/favoritesController.svelte";

import { StarIcon, StarOffIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { getCommonNoteMenuItems } from "@lib/menuItems/noteMenuItems..svelte";
import type { MenuItem } from "@projectTypes/ui/contextMenuTypes";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

let favorites: Note["id"][] = $derived(favoriteController.getFavorites());
</script>

{#snippet headingContent()}
   <div class="flex items-center gap-1">
      <StarIcon size="1.125em"></StarIcon>Favoritos
   </div>
{/snippet}

<Collapsible
   id="favorites"
   headingContent={headingContent}
   headingClass="border-base-400 rounded-field"
   chevronPosition="left">
   <ul class="pl-2">
      {#each favorites as favoriteId}
         {@const favoriteNote = noteQueryController.getNoteById(favoriteId)}
         {#if favoriteNote}
            {@const favoriteMenuItems: MenuItem[] = getCommonNoteMenuItems({
               noteId:favoriteId,
               showCreateChild: false,
               showDelete: false
            })}
            <Button
               class="w-full"
               dropdownMenuItems={favoriteMenuItems}
               onclick={() => {
                  workspaceController.openNote(favoriteNote.id);
               }}>
               {favoriteNote.title}
            </Button>
         {/if}
      {/each}
   </ul>
</Collapsible>
