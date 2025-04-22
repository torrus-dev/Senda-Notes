<script lang="ts">
import { SearchIcon } from "lucide-svelte";
import Slider from "@components/utils/Slider.svelte";
import { settingsController } from "@controllers/settingsController.svelte";

let searchQuery = $state("");
</script>

<aside class="gap-4">
   <h2 class="mb-8 py-2 text-2xl font-bold">Settings</h2>
   <div class="flex w-full flex-col gap-4">
      <div class="flex items-center justify-between py-2">
         <span>Toggle Dark mode</span>
         <Slider
            value={settingsController.getTheme() === "dark"}
            onChange={() => settingsController.toggleThemeMode()} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Toggle Lock Sidebar</span>
         <Slider
            value={settingsController.getLockSidebar()}
            onChange={() => settingsController.toggleLockSidebar()} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Toggle Show Metadata</span>
         <Slider
            value={settingsController.getShowMetadata()}
            onChange={() => settingsController.toggleShowMetadata()} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Toggle Editor Toolbar</span>
         <Slider
            value={settingsController.getShowEditorToolbar()}
            onChange={() => settingsController.toogleShowEditorToolbar()} />
      </div>
   </div>
</aside>
