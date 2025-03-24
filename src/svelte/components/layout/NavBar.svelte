<script>
import { FocusTarget } from "../../../types/types";

import { focusController } from "../../../controllers/focusController.svelte";
import { noteController } from "../../../controllers/noteController.svelte";
import { workspace } from "../../../controllers/workspaceController.svelte";

import { useResponsive } from "../../../directives/useResponsive.svelte";

import Breadcrumbs from "../utils/Breadcrumbs.svelte";
import Button from "../utils/Button.svelte";

import {
  MoreVerticalIcon,
  Trash2Icon,
  PenLineIcon,
  PanelLeftOpenIcon,
  PanelLeftCloseIcon,
} from "lucide-svelte";
import Navigation from "../utils/Navigation.svelte";
import { settingsController } from "../../../controllers/settingsController.svelte";

let { note } = $props();
let isSidebarOpen = $derived(workspace.isSidebarOpen());

const noteOptionsItems = [
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
];
</script>

<nav
  class="border-border-normal flex h-14 w-full items-center justify-between gap-2 p-2">
  <!-- toggle sidebar button -->

  {#if !settingsController.sidebarIsLocked || useResponsive().isMobile}
    {#if isSidebarOpen}
      <Button onclick={workspace.toggleSidebar}>
        <PanelLeftCloseIcon size="18" />
      </Button>
    {:else}
      <Button onclick={workspace.toggleSidebar}>
        <PanelLeftOpenIcon size="18" />
      </Button>
    {/if}
  {/if}
  <!-- navigation -->
  <Navigation />

  <div class="bg-base-200 rounded-selector flex-1 justify-between">
    <div class="flex items-center justify-between">
      <div class="overflow-x-auto px-2 py-1">
        <Breadcrumbs note={note ? note : null}></Breadcrumbs>
      </div>

      {#if note}
        <Button
          dropdownMenuItems={noteOptionsItems}
          contextMenuItems={noteOptionsItems}>
          <MoreVerticalIcon size="20" />
        </Button>
      {/if}
    </div>
  </div>
</nav>
