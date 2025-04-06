<script lang="ts">
import { SearchIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
import { settingsController } from "@controllers/settingsController.svelte";

let searchQuery = $state("");
</script>

<aside class="flex gap-2">
   <div class="bg-base-400 flex items-center rounded px-2 py-1">
      <SearchIcon class="h-5 w-5 text-gray-500" />
      <input
         type="text"
         name="search"
         class="ml-2 flex-1 bg-transparent focus:outline-none"
         bind:value={searchQuery}
         placeholder="Search..." />
   </div>
   <main>
      <h3>Appereance</h3>
      <div class="flex flex-col">
         <Button
            class="bordered"
            onclick={() => {
               settingsController.toggleThemeMode();
            }}>
            Toggle Dark/Light theme
         </Button>
         <Button
            class="bordered"
            onclick={() => {
               settingsController.toggleLockSidebar();
            }}>
            Toggle Lock Sidebar: {settingsController.getLockSidebar()}
         </Button>
         <Button
            class="bordered"
            onclick={() => {
               settingsController.toggleShowMetadata();
            }}>
            Toggle Show Metadata: {settingsController.getShowMetadata()}
         </Button>
         <Button
            class="bordered"
            onclick={() => {
               settingsController.toogleShowEditorToolbar();
            }}>
            Toggle Editor Toolbar: {settingsController.getShowEditorToolbar()}
         </Button>
      </div>
   </main>
</aside>
