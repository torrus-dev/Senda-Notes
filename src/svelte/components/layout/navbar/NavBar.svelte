<script lang="ts">
import Navigation from "@components/utils/Navigation.svelte";

import type { Note } from "@projectTypes/noteTypes";
import SidebarToogle from "../sidebar/SidebarToogle.svelte";
import { SearchIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

<nav class="bg-base-200">
   <div class="flex w-full items-center justify-between gap-2 p-2">
      <div class="flex items-center gap-2">
         <SidebarToogle />
         <Navigation />
         <Button>
            <SearchIcon size="1.125em" /> Search Notes
         </Button>
      </div>
      <div class="flex items-center gap-2"></div>
   </div>
</nav>
