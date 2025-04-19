<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import Button from "@components/utils/Button.svelte";

import { PanelLeftOpenIcon, PanelLeftCloseIcon } from "lucide-svelte";

let isSidebarOpen: boolean = $derived(workspace.isSidebarOpen());
let isSidebarLocked: boolean = $derived(settingsController.getLockSidebar());
let isMobile = $derived(screenSizeController.isMobile);
</script>

{#if !isSidebarLocked || isMobile}
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
