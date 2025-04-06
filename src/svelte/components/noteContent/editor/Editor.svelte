<script>
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/core";
import { onMount } from "svelte";

let { content } = $props();

let element = $state();
let editor = $state.raw();

onMount(() => {
   editor = new Editor({
      element: element,
      extensions: [StarterKit],
      content: content,
      onTransaction: () => {
         // force re-render so editor.isActive works as expected
         editor = editor;
      },
   });
});
</script>

{#if editor}
   <div class="control-group">
      <div class="button-group">
         <button
            onclick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            class={editor.isActive("bold") ? "highlight" : ""}>
            Bold
         </button>
         <button
            onclick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            class={editor.isActive("italic") ? "highlight" : ""}>
            Italic
         </button>
      </div>
   </div>
{/if}
<div bind:this={element} />
