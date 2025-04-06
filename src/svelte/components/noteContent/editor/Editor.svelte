<style>
.highlight {
   background-color: blue;
}
</style>

<script>
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/core";
import { onMount } from "svelte";

let { content } = $props();

let element = $state();
// Create a box to hold the editor using $state.raw
let editorBox = $state.raw(null);

onMount(() => {
   const editor = new Editor({
      element: element,
      extensions: [StarterKit],
      content: content,
      onTransaction: () => {
         // Create a new object containing the editor to trigger reactivity
         editorBox = { current: editor };
      },
   });

   // Initialize the editor box
   editorBox = { current: editor };
});
</script>

{#if editorBox?.current}
   <div class="control-group">
      <div class="button-group">
         <button
            onclick={() => editorBox.current.chain().focus().toggleBold().run()}
            disabled={!editorBox.current
               .can()
               .chain()
               .focus()
               .toggleBold()
               .run()}
            class={editorBox.current.isActive("bold") ? "highlight" : ""}>
            Bold
         </button>
         <button
            onclick={() =>
               editorBox.current.chain().focus().toggleItalic().run()}
            disabled={!editorBox.current
               .can()
               .chain()
               .focus()
               .toggleItalic()
               .run()}
            class={editorBox.current.isActive("italic") ? "highlight" : ""}>
            Italic
         </button>
      </div>
   </div>
{/if}
<div bind:this={element} />
