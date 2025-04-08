<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";

import Navigation from "@components/utils/Navigation.svelte";
import Breadcrumbs from "@components/utils/Breadcrumbs.svelte";
import Button from "@components/utils/Button.svelte";

import { PanelLeftOpenIcon, PanelLeftCloseIcon } from "lucide-svelte";

import type { Note } from "@projectTypes/noteTypes";
import MoreButton from "./MoreButton.svelte";

let { note }: { note: Note | undefined } = $props();
let isSidebarOpen: boolean = $derived(workspace.isSidebarOpen());
let isSidebarLocked: boolean = $derived(settingsController.getLockSidebar());
</script>

<nav
   class="border-border-normal flex h-14 w-full items-center justify-between gap-2 p-2">
   {#if !isSidebarLocked || screenSizeController.isMobile}
      {#if isSidebarOpen}
         <Button onclick={workspace.toggleSidebar}>
            <PanelLeftCloseIcon size="1.125em" />
         </Button>
      {:else}
         <Button onclick={workspace.toggleSidebar}>
            <PanelLeftOpenIcon size="1.125em" />
         </Button>
      {/if}
   {/if}
   <Navigation />

   <div class="bg-base-200 rounded-selector flex-1 justify-between">
      <div class="flex items-center justify-between">
         {#if note}
            <div class="overflow-x-auto px-2 py-1">
               <Breadcrumbs noteId={note.id}></Breadcrumbs>
            </div>
            <MoreButton noteId={note.id} />
         {/if}
      </div>
   </div>
</nav>
