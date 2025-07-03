<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { searchController } from "@controllers/navigation/searchController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { noteController } from "@controllers/notes/noteController.svelte";
import type { Tab } from "@model/navigation/workspaceModel.svelte";

let { tab }: { tab: Tab } = $props();
</script>

<section class="flex h-full w-full content-center">
   <div class="m-auto text-center">
      <header class="">
         <h1 class="my-4 text-center text-3xl font-bold">No note is open</h1>
      </header>
      <ul class="flex flex-col gap-0.5">
         <li>
            <Button onclick={() => noteController.createNote()}>
               Create new note
            </Button>
         </li>
         <li>
            <Button onclick={() => (searchController.isSearching = true)}>
               Search note
            </Button>
         </li>
         <li>
            <Button onclick={() => workspaceController.closeTabByTabId(tab.id)}>
               Close Tab
            </Button>
         </li>
      </ul>
   </div>
</section>
