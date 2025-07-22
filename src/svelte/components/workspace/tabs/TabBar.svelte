<style>
</style>

<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { settingsController } from "@controllers/application/SettingsController.svelte";
import { workspaceController } from "@controllers/navigation/WorkspaceController.svelte";
import { ChevronDownIcon, PlusIcon } from "lucide-svelte";
import Tab from "./Tab.svelte";

// Solo mostrar si hay más de una pestaña
let shouldShow = $derived(
   workspaceController.tabs.length > 1 ||
      settingsController.get("permanentTabBar"),
);
</script>

{#if shouldShow}
   <div class=" flex w-full items-center px-1">
      <ul class="flex flex-1 items-center gap-1">
         {#each workspaceController.tabs as tab, index (tab)}
            <Tab tab={tab} />
         {/each}
      </ul>
      <Button
         onclick={() => {
            workspaceController.createEmptyTab();
         }}>
         <PlusIcon size="1.125em" />
      </Button>

      <Button>
         <ChevronDownIcon size="1.125em" />
      </Button>
   </div>
{/if}
