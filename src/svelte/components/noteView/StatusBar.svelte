<script lang="ts">
import { workspace } from "@controllers/workspaceController.svelte";
let contentSaved = $derived(workspace.getContentSaved());
</script>

<div
   class="bg-base-200 fixed bottom-0 flex w-full items-center gap-2 px-4 py-2">
   Content Saved:
   <p class={contentSaved ? "text-emerald-500" : "text-error"}>
      {contentSaved}
   </p>
</div>
