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
import { floatingMenuController } from "../../../controllers/floatingMenuController.svelte";
import { settingsController } from "../../../controllers/settingsController.svelte";
import { getFormatMenuItems, editorUtils } from "./editorMenuItems.js";

let { noteId = null } = $props();
let content = $derived(noteController.getNoteById(noteId)?.content || "");
let editorInstance = null;
let editorElement;
let currentNoteId = null;
let currentWordRange = null;

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

  // Obtener información contextual basada en la posición y estado actual
  const contextInfo = editorUtils.getContextInfo(
    editorInstance,
    event.clientX,
    event.clientY,
  );

  if (!contextInfo) return;

  // Almacenar el rango de palabra para los comandos de formato
  currentWordRange = contextInfo.hasSelection
    ? contextInfo.selectionRange
    : contextInfo.wordRange;

  // Preparar elementos de menú con la palabra/selección actual
  const menuItems = getFormatMenuItems(editorInstance).map((item) => {
    if (item.separator) return item;

    // Modificar el onClick para aplicar al rango correcto
    return {
      ...item,
      onClick: () => {
        console.log("es alguna cosa de estas");
        if (currentWordRange) {
          // Para comandos que requieren selección explícita
          const { view } = editorInstance;
          const { state } = view;
          const { from, to } = currentWordRange;

          // Primero seleccionar la palabra
          view.dispatch(
            state.tr.setSelection(
              state.selection.constructor.create(state.doc, from, to),
            ),
          );

          // Luego ejecutar el comando original
          item.onClick();
        } else {
          // Si no hay rango, ejecutar normalmente
          item.onClick();
        }
      },
    };
  });

  // Mostrar el menú contextual con opciones de formato
  floatingMenuController.openContextMenu(
    { x: event.clientX, y: event.clientY },
    menuItems,
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
      onSelectionUpdate: () => {
        // Limpiar el rango de palabra cuando cambia la selección manualmente
        currentWordRange = null;
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

  currentWordRange = null;
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
