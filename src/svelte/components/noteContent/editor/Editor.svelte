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
import { parseEditorContent } from "@utils/editorUtils";

// Props
let { noteId = null } = $props();

// Estado derivado
let content: string = $derived(
   noteController.getNoteById(noteId)?.content || "",
);

// Referencias DOM y estado
let editorElement: HTMLElement;
let editorInstance: Editor | null = null;
let currentNoteId: string | null = null;

/**
 * Actualiza el contenido de la nota activa
 */
function onContentChange(newContent: string) {
   if (noteId) {
      noteController.updateNote(noteId, { content: newContent });
   }
}

/**
 * Inicializa el editor TipTap con el contenido proporcionado
 */
function initializeEditor(initialContent: string) {
   destroyEditor();

   const parsedContent = parseEditorContent(initialContent);

   editorInstance = new Editor({
      element: editorElement,
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
   });

   registerEditorWithFocusController();
}

/**
 * Registra el elemento editable ProseMirror con el focusController
 */
function registerEditorWithFocusController() {
   const tiptapEditableElement = editorElement?.querySelector(
      ".ProseMirror",
   ) as HTMLElement | null;

   if (tiptapEditableElement) {
      focusController.registerElement(
         FocusTarget.EDITOR,
         tiptapEditableElement,
      );
   }
}

/**
 * Limpia recursos del editor
 */
function destroyEditor() {
   if (editorInstance) {
      editorInstance.destroy();
      editorInstance = null;
   }
}

/**
 * Maneja el menú contextual del editor
 */
function handleContextMenu(event: MouseEvent) {
   event.preventDefault();

   if (!editorInstance) return;

   const { clientX, clientY } = event;
   const editorPosition = editorInstance.view.posAtCoords({
      left: clientX,
      top: clientY,
   });

   if (!editorPosition) return;

   const coordinates: Coordinates = { x: clientX, y: clientY };
   contextMenuController.openMenu(
      coordinates,
      getFormatMenuItems(editorInstance),
   );
}

// Efecto que inicializa el editor cuando cambia la nota activa
$effect(() => {
   if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      initializeEditor(content);
   }
});

// Efecto que maneja el enfoque del editor
$effect(() => {
   if (
      focusController.focus?.targetId === FocusTarget.EDITOR &&
      editorInstance
   ) {
      editorInstance.commands.focus();
   }
});

// Limpieza al destruir el componente
onDestroy(() => {
   destroyEditor();
   focusController.unregisterElement(FocusTarget.EDITOR);
});
</script>

<div
   bind:this={editorElement}
   role="document"
   class="prose prose-invert prose-neutral tiptap-editor"
   oncontextmenu={handleContextMenu}>
</div>
