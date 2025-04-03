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
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";

import { noteController } from "@controllers/noteController.svelte";
import { contextMenuController } from "@controllers/floatingMenuController.svelte.js";
import { focusController } from "@controllers/focusController.svelte";
import { FocusTarget } from "@projectTypes/focusTypes";
import type { Coordinates } from "@projectTypes/positionTypes";
import { getFormatMenuItems } from "./editorMenuItems";

let { noteId = null } = $props();

let content: string = $derived(
   noteController.getNoteById(noteId)?.content || "",
);

let editorElement: HTMLElement;

// Instancia del editor TipTap
let editorInstance: Editor | null = null;
let currentNoteId: string | null = null;
let currentWordRange: { from: number; to: number } | null = null;

// Función que actualiza el contenido de la nota
function onContentChange(newContent: string) {
   if (noteId) {
      noteController.updateNote(noteId, { content: newContent });
   }
}

// Inicializa el editor TipTap con el contenido inicial
function initializeEditor(initialContent: string) {
   destroyEditor();

   let parsedContent = initialContent;
   try {
      JSON.parse(initialContent);
      // Si es JSON válido, seguimos la lógica actual y usamos cadena vacía
      parsedContent = "";
   } catch (e) {
      parsedContent = initialContent || "";
   }

   editorInstance = new Editor({
      element: editorElement!,
      extensions: [
         StarterKit,
         TaskList,
         TaskItem.configure({ nested: true }),
         Highlight.configure({ multicolor: false }),
      ],
      content: parsedContent,
      autofocus: true,
      editable: true,
      injectCSS: false,
      onUpdate: ({ editor }) => {
         onContentChange(editor.getHTML());
      },
      onSelectionUpdate: () => {
         currentWordRange = null;
      },
   });

   // Registrar el elemento editable (.ProseMirror) en el focusController
   const tiptapEditableElement = editorElement.querySelector(
      ".ProseMirror",
   ) as HTMLElement | null;
   if (tiptapEditableElement) {
      focusController.registerElement(
         FocusTarget.EDITOR,
         tiptapEditableElement,
      );
   }

   // Usamos MouseEvent (en lugar de PointerEvent) para evitar conflictos de tipado
   editorElement.addEventListener(
      "contextmenu",
      openEditorContextMenu as EventListener,
   );
}

onDestroy(() => {
   destroyEditor();
   focusController.unregisterElement(FocusTarget.EDITOR);
});

// Destruye la instancia actual del editor y limpia listeners
function destroyEditor() {
   if (editorElement) {
      editorElement.removeEventListener(
         "contextmenu",
         openEditorContextMenu as EventListener,
      );
   }
   if (editorInstance) {
      editorInstance.destroy();
      editorInstance = null;
   }
   currentWordRange = null;
}

function openEditorContextMenu(event: MouseEvent) {
   event.preventDefault();

   // calculamos posición del context menu
   if (!editorInstance) return;

   const { clientX, clientY } = event;
   const editorPosition = editorInstance.view.posAtCoords({
      left: clientX,
      top: clientY,
   });
   if (!editorPosition) return;

   // abrimos contextMenu
   const coordinates: Coordinates = { x: clientX, y: clientY };
   contextMenuController.openMenu(
      coordinates,
      getFormatMenuItems(editorInstance),
   );
}

$effect(() => {
   if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      initializeEditor(content);
   }
});

// soporte para recibir el enfoque desde el focusController.
$effect(() => {
   if (
      focusController.focus?.targetId === FocusTarget.EDITOR &&
      editorInstance
   ) {
      editorInstance.commands.focus();
   }
});
</script>

<div
   bind:this={editorElement}
   class="prose prose-invert prose-neutral tiptap-editor">
</div>
