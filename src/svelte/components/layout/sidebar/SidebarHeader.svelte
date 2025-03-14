<script>
import { FilesIcon, SearchIcon, FileSearchIcon } from "lucide-svelte";
import Button from "../../utils/Button.svelte";
</script>

<!-- Header -->
<nav class="flex h-14 w-full items-center justify-between gap-4 p-2">
  <div class="flex gap-1">
    <Button>
      <FilesIcon size="20" />
    </Button>
    <Button>
      <SearchIcon size="20" />
    </Button>
  </div>
</nav>
