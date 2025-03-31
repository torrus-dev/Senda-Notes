<style>
.tiptap-editor {
   width: 100%;
   height: 100%;
   color: inherit;
}
</style>

<script lang="ts">
import { onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
// Importamos las nuevas extensiones
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";

import { noteController } from "@controllers/noteController.svelte";
import { contextMenuController } from "@controllers/contextMenuController.svelte.js";
import { focusController } from "@controllers/focusController.svelte";
import { getFormatMenuItems, editorUtils } from "./editorMenuItems.js";
import { FocusTarget } from "@projectTypes/focusTypes";
import type { Coordinates } from "@projectTypes/floatingMenuTypes.js";

let { noteId = null } = $props();
let content = $derived(noteController.getNoteById(noteId)?.content || "");
let editorInstance = null;
let editorElement;
let currentNoteId = null;
let currentWordRange = null;

// Registrar el elemento editable de TipTap con el focusController
$effect(() => {
   if (editorInstance && editorElement) {
      // TipTap crea elementos internos, necesitamos encontrar el elemento contenteditable
      const tiptapEditableElement = editorElement.querySelector(".ProseMirror");

      if (tiptapEditableElement) {
         focusController.registerElement(
            FocusTarget.EDITOR,
            tiptapEditableElement,
         );

         return () => {
            focusController.unregisterElement(FocusTarget.EDITOR);
         };
      }
   }
});

// Manejar las solicitudes de enfoque
$effect(() => {
   const { targetId, timestamp } = focusController.focus;
   if (targetId === FocusTarget.EDITOR && timestamp > 0 && editorInstance) {
      // Simplemente enfocamos sin seleccionar todo el texto
      editorInstance.commands.focus();
   }
});

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

   // Función para envolver el onClick con la lógica de selección
   function wrapWithSelection(originalOnClick) {
      return () => {
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
            originalOnClick();
         } else {
            // Si no hay rango, ejecutar normalmente
            originalOnClick();
         }
      };
   }

   // Obtener los elementos de menú base
   const baseMenuItems = getFormatMenuItems(editorInstance);

   // Procesar los elementos de menú
   const menuItems = baseMenuItems.map((item) => {
      // Si es un separador, devolverlo sin cambios
      if (item.separator) return item;

      // Crear una copia del item para no modificar el original
      const processedItem = { ...item };

      // Si el item tiene onClick, envolverlo con la lógica de selección
      if ("onClick" in processedItem) {
         const originalOnClick = processedItem.onClick;
         processedItem.onClick = wrapWithSelection(originalOnClick);
      }

      // Si el item tiene hijos (es un submenú), procesar cada hijo
      if (
         "children" in processedItem &&
         Array.isArray(processedItem.children)
      ) {
         console.log("procesando hijos");
         processedItem.children = processedItem.children.map((childItem) => {
            // Si es un separador, devolverlo sin cambios
            if (childItem.separator) return childItem;

            // Crear una copia del hijo para no modificar el original
            const processedChild = { ...childItem };

            // Si el hijo tiene onClick, envolverlo con la lógica de selección
            if ("onClick" in processedChild) {
               const originalChildOnClick = processedChild.onClick;
               processedChild.onClick = wrapWithSelection(originalChildOnClick);
            }

            return processedChild;
         });
      }

      return processedItem;
   });

   // Mostrar el menú contextual con opciones de formato
   const coordinates: Coordinates = { x: event.clientX, y: event.clientY };
   contextMenuController.openMenu(coordinates, menuItems);
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

      // Crear instancia del editor con las nuevas extensiones
      editorInstance = new Editor({
         element: editorElement,
         extensions: [
            StarterKit,
            // Añadimos las nuevas extensiones
            TaskList,
            TaskItem.configure({
               nested: true,
            }),
            Highlight.configure({
               multicolor: false, // Usamos solo un color para destacar
            }),
         ],
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
   bind:this={editorElement}
   class="prose prose-invert prose-neutral tiptap-editor w-full max-w-full">
</div>
