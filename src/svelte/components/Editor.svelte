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

<script>
import { workspace } from "../controllers/workspaceController.svelte";
import { onDestroy } from "svelte";
import EditorJS from "@editorjs/editorjs";
import DragDrop from "editorjs-drag-drop";
import { editorConfig } from "./editorConfig";
import { noteController } from "../controllers/noteController.svelte";
import { FocusTarget } from "../types/types";

let { noteId = null } = $props();
let content = $derived(noteController.getNoteById(noteId).content);

let editorInstance = null;
let dragDropInstance = null;
let isInitialized = false;
let currentNoteId = null;

function onContentChange(newContent) {
  if (noteId) {
    noteController.updateNote(noteId, {
      content: newContent,
    });
  }
}

function initializeEditor(initialContent = null) {
  destroyEditor(); // Limpiar instancias previas antes de crear una nueva

  try {
    editorInstance = new EditorJS({
      holder: "editorjs",
      tools: editorConfig,
      autofocus: true,
      inlineToolbar: ["bold", "italic", "link", "marker", "inlineCode"],
      data: initialContent ? JSON.parse(initialContent) : { blocks: [] },
      onReady: () => {
        dragDropInstance = new DragDrop(editorInstance);
        isInitialized = true;
      },
      onChange: async () => {
        if (!isInitialized) return;
        try {
          const savedData = await editorInstance.save();
          onContentChange(JSON.stringify(savedData));
        } catch (error) {
          console.error("Error al guardar el contenido del editor:", error);
        }
      },
    });
  } catch (error) {
    console.error("Error al inicializar EditorJS:", error);
  }
}

function destroyEditor() {
  if (dragDropInstance && typeof dragDropInstance.destroy === "function") {
    dragDropInstance.destroy();
    dragDropInstance = null;
  }
  if (editorInstance && typeof editorInstance.destroy === "function") {
    editorInstance.destroy();
    editorInstance = null;
  }
  isInitialized = false;
}

// Reactividad: solo reinicializa si cambia el noteId
$effect(() => {
  if (noteId !== currentNoteId) {
    currentNoteId = noteId;
    initializeEditor(content);
  }
});

onDestroy(() => {
  destroyEditor();
});
</script>

<div id="editorjs" class="font-stretch-75%"></div>
