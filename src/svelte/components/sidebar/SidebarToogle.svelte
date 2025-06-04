<script lang="ts">
import { settingsController } from "@controllers/settingsController.svelte";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import Button from "@components/utils/Button.svelte";

import { PanelLeftOpenIcon, PanelLeftCloseIcon } from "lucide-svelte";
import { sidebarController } from "@controllers/ui/sidebarController.svelte";

let isSidebarOpen: boolean = $derived(sidebarController.isOpen());
let isSidebarLocked: boolean = $derived(settingsController.getLockSidebar());
let isMobile = $derived(screenSizeController.isMobile);
</script>

{#if !isSidebarLocked || isMobile}
   {#if isSidebarOpen}
      <Button onclick={sidebarController.toggle} title="Close sidebar">
         <PanelLeftCloseIcon size="1.125em" />
      </Button>
   {:else}
      <Button onclick={sidebarController.toggle} title="Open sidebar">
         <PanelLeftOpenIcon size="1.125em" />
      </Button>
   {/if}
{/if}
