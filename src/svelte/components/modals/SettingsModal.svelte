<script lang="ts">
import GlobalPropertyMenu from "@components/globalProperties/GlobalPropertyMenu.svelte";
import Slider from "@components/utils/Slider.svelte";
import { settingsController } from "@controllers/application/settingsController.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

let searchQuery = $state("");
</script>

<aside class="gap-4">
   <h2 class="mb-8 py-2 text-2xl font-bold">Settings</h2>
   <div class="flex w-full flex-col gap-4">
      <div class="flex items-center justify-between py-2">
         <span>UI Mode</span>
         <select
            class="ml-4 rounded border px-2 py-1"
            value={settingsController.get("uiMode")}
            onchange={(event: Event) => {
               const target = event.target as HTMLSelectElement;
               settingsController.set("uiMode", target.value as UiModeType);
            }}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
         </select>
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Lock Sidebar on large screens</span>
         <Slider
            value={settingsController.get("sidebarIsLocked")}
            onChange={() => settingsController.toggle("sidebarIsLocked")} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Show note metadata on the editor</span>
         <Slider
            value={settingsController.get("showMetadata")}
            onChange={() => settingsController.toggle("showMetadata")} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Enable Editor Toolbar</span>
         <Slider
            value={settingsController.get("showEditorToolbar")}
            onChange={() => settingsController.toggle("showEditorToolbar")} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Debug Level: 0 none, 1 errors, 2 all</span>
         <input
            type="number"
            value={settingsController.get("debugLevel")}
            min="0"
            max="5"
            oninput={(event) => {
               const target = event.target as HTMLInputElement;
               if (target?.value) {
                  settingsController.set("debugLevel", Number(target.value));
               }
            }} />
      </div>
      <div class="flex items-center justify-between py-2">
         <span>Always show Tab Bar</span>
         <Slider
            value={settingsController.get("permanentTabBar")}
            onChange={() => settingsController.toggle("permanentTabBar")} />
      </div>
      <GlobalPropertyMenu />
   </div>
</aside>
