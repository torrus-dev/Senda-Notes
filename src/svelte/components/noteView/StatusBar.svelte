<script lang="ts">
import { editorController } from "@controllers/editorController.svelte";
let contentSaved = $derived(editorController.contentSaved);
let chararecterCount = $derived(editorController.chararecterCount);
let wordCount = $derived(editorController.wordCount);
let lineCount = $derived(editorController.lineCount);
</script>

<div
   class="bg-base-200 fixed bottom-0 flex w-full items-center gap-2 px-4 py-2">
   Content Saved:
   <p class={contentSaved ? "text-emerald-500" : "text-error"}>
      {contentSaved}
   </p>
   -
   <p>Characters: {chararecterCount}</p>
   <p>wordCount: {wordCount}</p>
   <p>lineCount: {lineCount}</p>
</div>
