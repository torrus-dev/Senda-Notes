<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";

import Collapsible from "@components/utils/Collapsible.svelte";
import { favoriteController } from "@controllers/ui/favoritesController.svelte";

import { workspace } from "@controllers/workspaceController.svelte";
import { StarIcon, StarOffIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let favorites: Note[] = $derived(favoriteController.getFavoritesAsNotes());
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
      {#each favorites as favorite}
         <Button
            class="w-full"
            dropdownMenuItems={[
               {
                  type: "action",
                  label: "Remove from favorites",
                  icon: StarOffIcon,
                  action: () => {
                     favoriteController.removeFromFavorites(favorite.id);
                  },
               },
            ]}
            onclick={() => {
               workspace.setActiveNoteId(favorite.id);
            }}>
            {favorite.title}
         </Button>
      {/each}
   </ul>
</Collapsible>
