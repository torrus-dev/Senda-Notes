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
import { contextMenuController } from "../../controllers/contextMenuController.svelte";

// Importar iconos de Lucide-Svelte
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-svelte";

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

  const { view } = editorInstance;
  const { state } = view;

  // Verificar si hay texto seleccionado
  const hasSelection = !state.selection.empty;

  // Si no hay selección, seleccionar la palabra actual
  if (!hasSelection) {
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (pos) {
      // Buscar los límites de la palabra actual
      const wordRange = findWordAt(state.doc, pos.pos);
      if (wordRange) {
        // Seleccionar la palabra
        const { from, to } = wordRange;
        view.dispatch(
          state.tr.setSelection(
            state.selection.constructor.create(state.doc, from, to),
          ),
        );
      }
    }
  }

  // Mostrar el menú contextual con opciones de formato
  contextMenuController.openContextMenu(
    { x: event.clientX, y: event.clientY },
    getFormatMenuItems(editorInstance),
  );
}

// Función para encontrar los límites de una palabra
function findWordAt(doc, pos) {
  // Si estamos en un espacio o al límite del documento, salir
  if (
    pos === 0 ||
    pos === doc.content.size ||
    (/\s/.test(doc.textBetween(Math.max(0, pos - 1), pos)) &&
      /\s/.test(doc.textBetween(pos, Math.min(doc.content.size, pos + 1))))
  ) {
    return null;
  }

  let from = pos;
  let to = pos;

  // Encontrar inicio de la palabra
  while (from > 0 && !/\s/.test(doc.textBetween(from - 1, from))) {
    from--;
  }

  // Encontrar fin de la palabra
  while (to < doc.content.size && !/\s/.test(doc.textBetween(to, to + 1))) {
    to++;
  }

  return { from, to };
}

// Crear elementos de menú para formato
function getFormatMenuItems(editor) {
  return [
    {
      label: "Negrita",
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    { separator: true },
    {
      label: "Encabezado 1",
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Encabezado 2",
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Encabezado 3",
      icon: Heading3,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { separator: true },
    {
      label: "Lista de viñetas",
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    { separator: true },
    {
      label: "Cita",
      icon: Quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Código",
      icon: Code,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];
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
  class="tiptap-editor prose prose-neutral lg:prose-lg w-full max-w-full {workspace.theme ===
  'dark'
    ? 'prose-invert'
    : ''}">
</div>
