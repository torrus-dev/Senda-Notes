<script lang="ts">
import type { Note } from "@projectTypes/noteTypes";
import NavigationButtons from "@components/layout/navbar/NavigationButtons.svelte";
import SidebarToogle from "@components/layout/sidebar/SidebarToogle.svelte";
import NavigationBar from "@components/layout/navbar/NavigationBar.svelte";

let { note }: { note: Note | undefined } = $props();
</script>

<nav class="bg-base-100">
   <div class="flex w-full items-center gap-0 p-2 md:gap-8">
      <div class="flex items-center gap-2">
         <SidebarToogle />
         <NavigationButtons />
      </div>
      <NavigationBar note={note} />
   </div>
</nav>
