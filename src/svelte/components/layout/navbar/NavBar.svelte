<script lang="ts">
import Navigation from "@components/utils/Navigation.svelte";

import type { Note } from "@projectTypes/noteTypes";
import SidebarToogle from "../sidebar/SidebarToogle.svelte";
import NavigationModule from "./NavigationModule.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

<nav class="bg-base-100">
   <div class="flex w-full items-center gap-0 p-2 md:gap-8">
      <div class="flex items-center gap-2">
         <SidebarToogle />
         <Navigation />
      </div>
      <NavigationModule noteId={note?.id} />
   </div>
</nav>
