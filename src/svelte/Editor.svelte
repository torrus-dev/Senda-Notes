<script>
  import { onMount, onDestroy } from "svelte";
  import EditorJS from "@editorjs/editorjs";
  import DragDrop from "editorjs-drag-drop";
  import { editorConfig } from "./editorConfig";

  const { content, noteId, onContentChange } = $props();

  let editor;
  let currentNoteId = $state(null);

  const initEditor = (noteContent = null) => {
    if (editor && typeof editor.destroy === "function") {
      editor.destroy();
    }

    let initialData;
    try {
      initialData = noteContent ? JSON.parse(noteContent) : { blocks: [] };
    } catch (error) {
      console.error("Error parsing content:", error);
      initialData = { blocks: [] };
    }

    editor = new EditorJS({
      holder: "editorjs",
      tools: editorConfig,
      autofocus: true,
      inlineToolbar: ["bold", "italic", "link", "marker", "inlineCode"],
      dragDrop: true,
      onReady: () => {
        new DragDrop(editor);
      },
      defaultBlock: "paragraph",
      enableMovingByArrowKeys: true,
      data: initialData,
      onChange: () => {
        // Usamos .then() en lugar de async/await
        editor
          .save()
          .then((outputData) => {
            onContentChange(JSON.stringify(outputData));
          })
          .catch((error) => {
            console.error("Saving failed: ", error);
          });
      },
    });
  };

  // Reinicializamos el editor cuando cambia la nota
  $effect(() => {
    if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      initEditor(content);
    }
  });

  onDestroy(() => {
    if (editor && typeof editor.destroy === "function") {
      editor.destroy();
    }
  });
</script>

<div id="editorjs"></div>

<style>
  :global(.codex-editor),
  :global(.ce-block),
  :global(.ce-toolbar__content) {
    max-width: 100% !important;
    width: 100% !important;
  }

  :global(.ce-block__content) {
    max-width: 100% !important;
    margin: 0 auto;
    position: relative;
  }

  :global(.ce-paragraph),
  :global(.ce-header),
  :global(.cdx-list) {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  :global(.ce-block--dragging) {
    opacity: 0.5;
    pointer-events: none;
  }

  :global(.ce-block--dropped) {
    animation: dropAnimation 0.3s ease;
  }

  @keyframes dropAnimation {
    from {
      opacity: 0.5;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
