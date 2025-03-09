<script>
import { FocusTarget } from "../../types/types";

import { focusController } from "../../controllers/focusController.svelte";
import { noteController } from "../../controllers/noteController.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";

import DropdownList from "../utils/DropdownList.svelte";
import Breadcrumbs from "../utils/Breadcrumbs.svelte";
import Button from "../utils/Button.svelte";

import {
  MoreVerticalIcon,
  Trash2Icon,
  PenLineIcon,
  PanelLeftOpenIcon,
  PanelLeftCloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-svelte";

let { note } = $props();
let isSidebarOpen = $derived(workspace.isSidebarOpen());
</script>

<nav
  class="border-border-normal flex h-14 w-full items-center justify-between gap-2 p-2 shadow">
  <!-- left button controls -->

  {#if isSidebarOpen}
    <Button onclick={workspace.toggleSidebar}>
      <PanelLeftCloseIcon size="18" />
    </Button>
  {:else}
    <Button onclick={workspace.toggleSidebar}>
      <PanelLeftOpenIcon size="18" />
    </Button>
  {/if}
  <div class="flex gap-1">
    <Button>
      <ArrowLeftIcon size="18" />
    </Button>
    <Button>
      <ArrowRightIcon size="18" />
    </Button>
  </div>

  <div class="bg-base-200 rounded-selector flex-1 justify-between">
    <div class="flex items-center justify-between">
      <div class="overflow-x-auto px-2 py-1">
        <Breadcrumbs note={note ? note : null}></Breadcrumbs>
      </div>

      {#if note}
        <DropdownList
          position="end"
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
    </div>
  </div>
</nav>
