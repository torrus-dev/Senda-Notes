<script lang="ts">
import { editorController } from "@controllers/editorController.svelte";

let contentSaved = $derived(editorController.contentSaved);
let chararecterCount = $derived(editorController.chararecterCount);
let wordCount = $derived(editorController.wordCount);
let lineCount = $derived(editorController.lineCount);
</script>

<div class="bg-base-200 flex justify-between gap-2 px-4 py-0.5">
   <div class="flex items-center gap-2">
      <p>
         <span class={contentSaved ? "text-emerald-500" : "text-muted-content"}>
            {contentSaved ? "Saved" : "Unsaved"}
         </span>
      </p>
   </div>

   <div class="text-muted-content flex items-center gap-3">
      <p>Char {chararecterCount}</p>
      <p>Words {wordCount}</p>
      <p>Lines {lineCount}</p>
   </div>
</div>
