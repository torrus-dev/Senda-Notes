<script lang="ts">
import type { Note } from "@projectTypes/core/noteTypes";
import NavigationButtons from "@components/navbar/NavigationButtons.svelte";
import SidebarToogle from "@components/sidebar/SidebarToogle.svelte";
import NavigationBar from "@components/navbar/search/NavigationBar.svelte";
import WindowControls from "@components/navbar/WindowControls.svelte";
import { noteController } from "@controllers/notes/noteController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";

let note = $derived(noteQueryController.getActiveNote());
</script>

<nav class="bg-base-100" style="-webkit-app-region: drag">
   <div class="flex w-full items-center gap-0 p-2">
      <!-- zona de arrastre deberia ser todo, pero que no se se pueda arrastrar si damos a otros botones -->
      <div class=" flex-1/6">
         <div
            style="-webkit-app-region: no-drag"
            class="mr-auto flex w-fit items-center gap-1">
            <SidebarToogle />
            <NavigationButtons />
         </div>
      </div>
      <div class="md:flex-4/6" style="-webkit-app-region: no-drag">
         <NavigationBar note={note} />
      </div>
      <div class="md:flex-1/6">
         <div
            class="ml-auto flex w-fit items-center"
            style="-webkit-app-region: no-drag">
            <WindowControls />
         </div>
      </div>
   </div>
</nav>
