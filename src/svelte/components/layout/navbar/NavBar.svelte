<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";

import Navigation from "@components/utils/Navigation.svelte";
import Button from "@components/utils/Button.svelte";

import { PanelLeftOpenIcon, PanelLeftCloseIcon } from "lucide-svelte";

import type { Note } from "@projectTypes/noteTypes";
import MoreButton from "./MoreButton.svelte";
import NavigationModule from "./NavigationModule.svelte";

let { note }: { note: Note | undefined } = $props();
let isSidebarOpen: boolean = $derived(workspace.isSidebarOpen());
let isSidebarLocked: boolean = $derived(settingsController.getLockSidebar());
</script>

<nav>
   <div
      class="border-border-normal flex h-14 w-full items-center justify-between gap-2 p-2">
      {#if !isSidebarLocked || screenSizeController.isMobile}
         {#if isSidebarOpen}
            <Button onclick={workspace.toggleSidebar} title="Close sidebar">
               <PanelLeftCloseIcon size="1.125em" />
            </Button>
         {:else}
            <Button onclick={workspace.toggleSidebar} title="Open sidebar">
               <PanelLeftOpenIcon size="1.125em" />
            </Button>
         {/if}
      {/if}
      <Navigation />

      <div class="bg-base-200 rounded-selector flex-1 justify-between">
         <div class="flex items-center justify-between">
            <NavigationModule
               note={note ? { id: note.id, title: note.title } : undefined} />
            {#if note}
               <MoreButton noteId={note.id} />
            {/if}
         </div>
      </div>
   </div>
</nav>
