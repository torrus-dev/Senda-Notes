<script lang="ts">
import { focusController } from "@controllers/focusController.svelte";
import { noteController } from "@controllers/note/noteController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import {
   MoreVerticalIcon,
   Trash2Icon,
   PenLineIcon,
   FileSearchIcon,
} from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { favoriteController } from "@controllers/ui/favoritesController.svelte";

let { noteId } = $props();

let favoritesText = $derived(
   !favoriteController.isFavorite(noteId)
      ? "Add to favorites"
      : "Remove from favorites",
);

const noteOptionsItems: MenuItem[] = $derived([
   {
      type: "action",
      label: "Rename Note",
      icon: PenLineIcon,
      action: () => {
         focusController.requestFocus(FocusTarget.TITLE);
      },
   },
   {
      type: "action",
      label: favoritesText,
      icon: PenLineIcon,
      action: () => {
         favoriteController.toggleFavorite(noteId);
      },
   },
   {
      type: "action",
      label: "Delete Note",
      icon: Trash2Icon,
      action: () => noteController.deleteNoteWithConfirmation(noteId),
      class: "text-error",
   },
   { type: "separator" },
   {
      type: "action",
      label: "Search in Note",
      icon: FileSearchIcon,
      action: () => {},
   },
   {
      type: "action",
      label: "Replace in Note",
      icon: FileSearchIcon,
      action: () => {},
   },
]);
</script>

<Button dropdownMenuItems={noteOptionsItems} title="More options">
   <MoreVerticalIcon size="1.25em" />
</Button>
