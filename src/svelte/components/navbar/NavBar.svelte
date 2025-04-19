<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import NavigationButtons from "@components/navbar/NavigationButtons.svelte";
import SidebarToogle from "@components/sidebar/SidebarToogle.svelte";
import NavigationBar from "@components/navbar/NavigationBar.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

<nav class="bg-base-100">
   <div class="flex w-full items-center gap-0 p-2">
      <div class="flex flex-1/6 items-center gap-1">
         <SidebarToogle />
         <NavigationButtons />
      </div>
      <div class="md:flex-3/6">
         <NavigationBar note={note} />
      </div>
      <div class="md:flex-1/6"></div>
   </div>
</nav>
