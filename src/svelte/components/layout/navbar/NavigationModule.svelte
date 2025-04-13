<script lang="ts">
import MoreButton from "@components/layout/navbar/MoreButton.svelte";
import SearchModule from "./SearchModule.svelte";
import { SearchIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";

let { noteId }: { noteId: string | undefined } = $props();
</script>

<div class="bg-base-200 rounded-field flex w-full justify-between gap-2">
   <SearchModule noteId={noteId} />
   <div class="flex gap-1">
      <Button>
         <SearchIcon size="1.125em" /> Buscar
      </Button>
      {#if noteId}
         <MoreButton noteId={noteId} />
      {/if}
   </div>
</div>
