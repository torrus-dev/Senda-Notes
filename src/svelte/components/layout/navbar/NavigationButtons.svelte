<script lang="ts">
import Button from "@components/utils/Button.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from "lucide-svelte";
</script>

<div class="flex gap-0.5">
   <Button onclick={() => {}} title="Go back">
      <ArrowLeftIcon size="1.125em" />
   </Button>
   <Button onclick={() => {}} title="Go forward">
      <ArrowRightIcon size="1.125em" />
   </Button>
   <Button
      onclick={() => {
         workspace.unsetActiveNoteId();
      }}
      title="Home screen">
      <HomeIcon size="1.125em" />
   </Button>
</div>
