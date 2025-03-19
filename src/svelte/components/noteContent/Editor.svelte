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
import { noteController } from "../../controllers/noteController.svelte";
import { contextMenuController } from "../../controllers/contextMenuController.svelte";
import { settingsController } from "../../controllers/settingsController.svelte";

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
  // Resolvemos la posición para obtener información del nodo
  const resolvedPosition = doc.resolve(pos);
  // Los límites del bloque actual
  const blockStart = resolvedPosition.start();
  const blockEnd = resolvedPosition.end();
  // Obtenemos el texto del bloque, insertando un espacio en saltos de nodo
  const blockText = doc.textBetween(blockStart, blockEnd, " ");
  // Calculamos la posición relativa dentro del bloque
  const offset = pos - blockStart;

  // Si en la posición hay un espacio, no hay palabra a seleccionar
  if (/\s/.test(blockText[offset])) return null;

  let start = offset;
  let end = offset;

  // Retrocedemos hasta encontrar un espacio o el inicio del bloque
  while (start > 0 && !/\s/.test(blockText[start - 1])) {
    start--;
  }

  // Avanzamos hasta encontrar un espacio o el final del bloque
  while (end < blockText.length && !/\s/.test(blockText[end])) {
    end++;
  }

  return { from: blockStart + start, to: blockStart + end };
}

// Crear elementos de menú para formato con estado de checked
function getFormatMenuItems(editor) {
  return [
    {
      label: "Negrita",
      icon: Bold,
      checked: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      icon: Italic,
      checked: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    { separator: true },
    {
      label: "Encabezado 1",
      icon: Heading1,
      checked: editor.isActive("heading", { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Encabezado 2",
      icon: Heading2,
      checked: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Encabezado 3",
      icon: Heading3,
      checked: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { separator: true },
    {
      label: "Lista de viñetas",
      icon: List,
      checked: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      checked: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    { separator: true },
    {
      label: "Cita",
      icon: Quote,
      checked: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Código",
      icon: Code,
      checked: editor.isActive("codeBlock"),
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
  class="tiptap-editor prose prose-neutral lg:prose-lg w-full max-w-full {settingsController.theme ===
  'dark'
    ? 'prose-invert'
    : ''}">
</div>
