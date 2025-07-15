<script lang="ts">
import { MoreVerticalIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { getCommonNoteMenuItems } from "@lib/menuItems/noteMenuItems..svelte";

let { noteId } = $props();
</script>

<Button
   dropdownMenuItems={getCommonNoteMenuItems({
      noteId,
      showCreateChild: false,
      showOpenInNewTab: false,
      showSearch: true,
      showReplace: true,
      showRename: true,
   })}
   title="More options">
   <MoreVerticalIcon size="1.25em" />
</Button>
