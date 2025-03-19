<style>
.tiptap-editor {
  width: 100%;
  height: 100%;
  color: inherit;
}

:global(.tiptap-editor > div:focus) {
  outline: none;
}
</style>

<script>
import { onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { noteController } from "../../../controllers/noteController.svelte";
import { contextMenuController } from "../../../controllers/contextMenuController.svelte";
import { settingsController } from "../../../controllers/settingsController.svelte";
import { getFormatMenuItems, editorUtils } from "./editorMenuItems.js";

let { noteId = null } = $props();
let content = $derived(noteController.getNoteById(noteId)?.content || "");
let editorInstance = null;
let editorElement;
let currentNoteId = null;

// Función para actualizar el contenido de la nota
function onContentChange(newContent) {
  if (noteId) {
    noteController.updateNote(noteId, { content: newContent });
  }
}

// Función para manejar el clic derecho en el editor
function handleEditorContextMenu(event) {
  event.preventDefault();

  // Si no hay una instancia del editor, salir
  if (!editorInstance) return;

  // Intentar seleccionar la palabra en la posición del clic
  editorUtils.selectWordAtPosition(
    editorInstance,
    event.clientX,
    event.clientY,
  );

  // Mostrar el menú contextual con opciones de formato
  contextMenuController.openContextMenu(
    { x: event.clientX, y: event.clientY },
    getFormatMenuItems(editorInstance),
  );
}

// Inicializar el editor
function initializeEditor(initialContent = "") {
  destroyEditor();

  try {
    // Procesar el contenido inicial
    let initialData = initialContent;
    try {
      const parsedContent = JSON.parse(initialContent);
      initialData = "";
    } catch (e) {
      initialData = initialContent || "";
    }

    // Crear instancia del editor
    editorInstance = new Editor({
      element: editorElement,
      extensions: [StarterKit],
      content: initialData,
      autofocus: true,
      editable: true,
      injectCSS: false,
      onUpdate: ({ editor }) => {
        onContentChange(editor.getHTML());
      },
    });

    // Agregar listener para el clic derecho
    if (editorElement) {
      editorElement.addEventListener("contextmenu", handleEditorContextMenu);
    }
  } catch (error) {
    console.error("Error al inicializar TipTap:", error);
  }
}

// Limpiar recursos
function destroyEditor() {
  if (editorElement) {
    editorElement.removeEventListener("contextmenu", handleEditorContextMenu);
  }

  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
}

// Efecto para inicializar el editor cuando cambia el noteId
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

<div
  id="editor"
  bind:this={editorElement}
  class="tiptap-editor prose prose-neutral lg:prose-lg w-full max-w-full {settingsController.theme ===
  'dark'
    ? 'prose-invert'
    : ''}">
</div>
