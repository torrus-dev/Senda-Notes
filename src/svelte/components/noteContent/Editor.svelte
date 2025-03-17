<style>
.tiptap-editor {
  width: 100%;
  height: 100%;
  outline: none;
  color: inherit;
}

:global(.tiptap-editor > div:focus) {
  outline: none;
}

/* Estilos básicos para empezar */
:global(.tiptap-editor p) {
  margin-bottom: 0.5rem;
}

:global(.tiptap-editor ul, .tiptap-editor ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

:global(
  .tiptap-editor h1,
  .tiptap-editor h2,
  .tiptap-editor h3,
  .tiptap-editor h4,
  .tiptap-editor h5,
  .tiptap-editor h6
) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

:global(.tiptap-editor h1) {
  font-size: 1.8rem;
}
:global(.tiptap-editor h2) {
  font-size: 1.6rem;
}
:global(.tiptap-editor h3) {
  font-size: 1.4rem;
}
:global(.tiptap-editor h4) {
  font-size: 1.2rem;
}
:global(.tiptap-editor h5) {
  font-size: 1.1rem;
}
:global(.tiptap-editor h6) {
  font-size: 1rem;
}

:global(.tiptap-editor pre) {
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}

:global(.tiptap-editor code) {
  font-family: monospace;
}

:global(.tiptap-editor blockquote) {
  border-left: 3px solid #ddd;
  padding-left: 1rem;
  margin-left: 0;
  font-style: italic;
}
</style>

<script>
import { onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { noteController } from "../../controllers/noteController.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";

let { noteId = null } = $props();
let content = $derived(noteController.getNoteById(noteId)?.content || "");
let editorInstance = null;
let editorElement;
let currentNoteId = null;

function onContentChange(newContent) {
  if (noteId) {
    noteController.updateNote(noteId, {
      content: newContent,
    });
  }
}

function initializeEditor(initialContent = "") {
  destroyEditor(); // Limpiar instancias previas antes de crear una nueva

  try {
    // Convertir el contenido inicial si es necesario
    let initialData = initialContent;
    try {
      // Intenta parsear el contenido como JSON por compatibilidad
      const parsedContent = JSON.parse(initialContent);
      // Si es un objeto EditorJS, usamos un string vacío
      initialData = "";
    } catch (e) {
      // Si no es JSON, asumimos que ya es un string válido para TipTap
      initialData = initialContent || "";
    }

    editorInstance = new Editor({
      element: editorElement,
      extensions: [StarterKit],
      content: initialData,
      autofocus: true,
      editable: true,
      injectCSS: false,
      onUpdate: ({ editor }) => {
        // Guardar el contenido en formato HTML
        const html = editor.getHTML();
        onContentChange(html);
      },
    });
  } catch (error) {
    console.error("Error al inicializar TipTap:", error);
  }
}

function destroyEditor() {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
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

<div
  id="editor"
  bind:this={editorElement}
  class="tiptap-editor prose prose-neutral lg:prose-lg w-full max-w-full {workspace.theme ===
  'dark'
    ? 'prose-invert'
    : ''}">
</div>
