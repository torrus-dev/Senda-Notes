<script lang="ts">
import { FilesIcon, SearchIcon } from "lucide-svelte";
import Button from "@components/utils/Button.svelte";
</script>

<nav class="flex h-14 w-full items-center justify-between gap-4 p-2">
   <div class="flex gap-1">
      <Button>
         <FilesIcon size="1.25em" />
      </Button>
      <Button>
         <SearchIcon size="1.25em" />
      </Button>
   </div>
</nav>
