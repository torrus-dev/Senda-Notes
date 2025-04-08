<script lang="ts">
import { focusController } from "@controllers/focusController.svelte";
import { noteController } from "@controllers/noteController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import type { MenuItem } from "@projectTypes/editorMenuTypes";
import {
   MoreVerticalIcon,
   Trash2Icon,
   PenLineIcon,
   FileSearchIcon,
} from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { noteId } = $props();

const noteOptionsItems: MenuItem[] = [
   {
      type: "action",
      label: "Rename Note",
      icon: PenLineIcon,
      action: () => {
         console.log("fire");
         focusController.requestFocus(FocusTarget.TITLE);
      },
   },
   {
      type: "action",
      label: "Delete Note",
      icon: Trash2Icon,
      action: () => noteController.deleteNote(noteId),
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
];
</script>

<Button
   dropdownMenuItems={noteOptionsItems}
   contextMenuItems={noteOptionsItems}
   title="More options">
   <MoreVerticalIcon size="1.25em" />
</Button>
