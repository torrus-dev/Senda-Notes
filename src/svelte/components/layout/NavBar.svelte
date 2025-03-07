<script>
import { FocusTarget } from "../../types/types";

import { focusController } from "../../controllers/focusController.svelte";

import DropdownList from "../utils/DropdownList.svelte";
import Breadcrumbs from "../utils/Breadcrumbs.svelte";
import Button from "../utils/Button.svelte";

import {
  MoreVerticalIcon,
  Trash2Icon,
  PenLineIcon,
  PanelLeftIcon,
} from "lucide-svelte";

let { note } = $props();
</script>

<nav
  class="border-border-normal flex min-h-16 w-full items-center justify-between gap-4 border-b-2 px-8 py-2 shadow-sm">
  <Button>
    <PanelLeftIcon size="18" />
  </Button>
  <div class="bg-base-200 rounded-selector flex-1 px-2 py-1">
    <Breadcrumbs note={note ? note : null}></Breadcrumbs>
  </div>
  {#if note}
    <DropdownList
      position="end"
      labelClass="outlined"
      menuItems={[
        {
          label: "Rename Note",
          icon: PenLineIcon,
          onClick: () => {
            focusController.requestFocus(FocusTarget.TITLE);
          },
        },
        {
          label: "Delete Note",
          icon: Trash2Icon,
          onClick: () => noteController.deleteNote(note.id),
          class: "text-error",
        },
      ]}>
      {#snippet label()}
        <MoreVerticalIcon size="20" />
      {/snippet}
    </DropdownList>
  {/if}
</nav>
