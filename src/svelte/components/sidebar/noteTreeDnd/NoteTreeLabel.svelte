<style>
.isExpanded div {
   transform: rotate(90deg);
}
</style>

<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";
import { noteController } from "@controllers/notes/noteController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import {
   ChevronRightIcon,
   PlusIcon,
   PenLineIcon,
   Trash2Icon,
   StarIcon,
   StarOffIcon,
   ArrowUpRight,
   SquarePlusIcon,
} from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { contextMenu } from "@directives/floatingMenuDirective.svelte";
import { favoriteController } from "@controllers/notes/favoritesController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import NoteTitleEditor from "@components/note/widgets/NoteTitleEditor.svelte";
import { getCommonNoteMenuItems } from "@lib/menuItems/noteMenuItems..svelte";

let {
   note,
   toggleExpansion,
   isExpanded,
   isEditingTitle = $bindable(),
}: {
   note: Note;
   toggleExpansion: (event: Event) => void;
   isExpanded: boolean;
   isEditingTitle: boolean;
} = $props();

let isActive = $derived(note.id === workspaceController.activeNoteId);
let childrenCount = $derived(noteQueryController.getDescendantCount(note.id));
let hasChildren = $derived(childrenCount > 0);

let isFavorited = $derived(favoriteController.isFavorite(note.id));

const handleSelectTitle = (event: KeyboardEvent | MouseEvent) => {
   if (!isEditingTitle) {
      if (("key" in event && event.key === "Enter") || event.type === "click") {
         // Solo seleccionar la nota si no estamos en modo edición
         workspaceController.openNote(note.id);
      }
   }
};
</script>

<div
   class="group rounded-field bg-interactive flex min-w-fit flex-row justify-between px-2 py-1.5 pl-1 whitespace-nowrap select-none
      {isActive ? 'bg-interactive-focus' : ''} 
      {isEditingTitle ? 'outline-interactive-accent-focus outline-2' : ''}"
   role="button"
   tabindex="0"
   use:contextMenu={getCommonNoteMenuItems({
      noteId: note.id,
      showRename: true,
      onRename: () => {
         isEditingTitle = true;
      },
   })}
   onclick={handleSelectTitle}
   onkeydown={handleSelectTitle}>
   <div class="flex flex-grow-1 gap-1">
      {#if hasChildren}
         <button
            class="transition-color rounded-selector hover:bg-interactive-hover cursor-pointer items-center whitespace-nowrap duration-200 ease-in-out
          {isExpanded ? 'isExpanded' : ''}"
            onclick={toggleExpansion}
            aria-expanded={isExpanded ? "true" : "false"}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}>
            <div class="transition duration-200">
               <ChevronRightIcon size="1.0625rem" aria-hidden="true" />
            </div>
         </button>
      {:else}
         <span class="w-4"></span>
      {/if}

      <NoteTitleEditor
         noteId={note.id}
         noteTitle={note.title}
         class="truncate {!isExpanded ? 'text-muted-content' : ''}"
         bind:isEditing={isEditingTitle} />
   </div>
   <div class="flex items-center">
      <Button
         onclick={(event) => {
            event?.stopPropagation();
            noteController.createNote(note.id);
         }}
         class="text-muted-content p-1 opacity-0 group-hover:opacity-100"
         size="small"
         title="Add child note">
         <PlusIcon size="1.125em"></PlusIcon>
      </Button>
      {#if childrenCount > 0}
         <p class="text-faint-content ml-1">
            {childrenCount}
         </p>
      {/if}
   </div>
</div>
