<script>
  import { onDestroy } from "svelte";
  import EditorJS from "@editorjs/editorjs";
  import DragDrop from "editorjs-drag-drop";
  import { editorConfig } from "./editorConfig";

  const { noteId, content, onContentChange } = $props();

  let editorInstance = $state(null);
  let isInitialized = $state(false);
  let currentNoteId = $state(null);

  // Inicialización del editor
  function initializeEditor(initialContent = null) {
    if (currentNoteId !== noteId) {
      currentNoteId = noteId;
    }
    if (editorInstance !== null) {
      editorInstance = null;
    }
    editorInstance = new EditorJS({
      holder: "editorjs",
      tools: editorConfig,
      autofocus: true,
      inlineToolbar: ["bold", "italic", "link", "marker", "inlineCode"],
      dragDrop: true,
      onReady: () => {
        new DragDrop(editorInstance);
        isInitialized = true;
      },
      data: initialContent ? JSON.parse(initialContent) : { blocks: [] },
      onChange: async () => {
        if (!isInitialized) return;

        try {
          const savedData = await editorInstance.save();
          onContentChange(JSON.stringify(savedData));
        } catch (error) {
          console.error("Error saving editor content:", error);
        }
      },
    });
  }

  initializeEditor(content);
  // Efecto para actualizar el editor cuando cambia el noteId
  $effect(() => {
    if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      initializeEditor(content);
    }
  });

  // Limpieza al destruir el componente
  onDestroy(() => {
    if (editorInstance && typeof editorInstance.destroy === "function") {
      editorInstance.destroy();
      editorInstance = null; // Limpiamos la instancia
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
