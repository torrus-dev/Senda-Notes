<script lang="ts">
import { settingsController } from "@controllers/application/SettingsController.svelte";
import { screenSizeController } from "@controllers/application/ScreenSizeController.svelte";
import Button from "@components/utils/Button.svelte";

import { PanelLeftOpenIcon, PanelLeftCloseIcon } from "lucide-svelte";
import { sidebarController } from "@controllers/ui/SidebarController.svelte";

let isSidebarOpen: boolean = $derived(sidebarController.isOpen);
let isSidebarLocked: boolean = $derived(
   settingsController.get("sidebarIsLocked"),
);
let isMobile = $derived(screenSizeController.isMobile);

function toggleSidebar() {
   sidebarController.toggle();
}
</script>

{#if !isSidebarLocked || isMobile}
   {#if isSidebarOpen}
      <Button onclick={toggleSidebar} title="Close sidebar">
         <PanelLeftCloseIcon size="1.125em" />
      </Button>
   {:else}
      <Button onclick={toggleSidebar} title="Open sidebar">
         <PanelLeftOpenIcon size="1.125em" />
      </Button>
   {/if}
{/if}
