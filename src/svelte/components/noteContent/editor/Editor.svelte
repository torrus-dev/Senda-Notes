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

import { noteController } from "@controllers/noteController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { focusController } from "@controllers/focusController.svelte";

import { floatingMenuController } from "@controllers/floatingMenuController.svelte.js";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import Toolbar from "../Toolbar.svelte";

import { FocusTarget } from "@projectTypes/focusTypes";
import type { Coordinates } from "@projectTypes/floatingMenuTypes";
import { getEditorContextMenuItems } from "@utils/editorMenuItems";
import { parseEditorContent, createEditorConfig } from "@utils/editorUtils";

// Props
let { noteId = null } = $props();

// Estado derivadoe
let content: string = $derived(
   noteController.getNoteById(noteId)?.content || "",
);

// Referencias DOM y estado
let editorElement: HTMLElement;
let editorInstance: Editor | null = $state(null);
let currentNoteId: string | null = null;

let isMobile: boolean = $derived(screenSizeController.isMobile);

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

   // Utilizamos la configuración desde editorUtils
   const editorConfig = createEditorConfig({
      element: editorElement,
      content: parsedContent,
      onUpdate: ({ editor }) => onContentChange(editor.getHTML()),
   });

   editorInstance = new Editor(editorConfig);
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
   floatingMenuController.openContextMenu(
      coordinates,
      getEditorContextMenuItems(editorInstance),
   );
}

// Inicializar editor cuando cambia la nota activa
$effect(() => {
   if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      initializeEditor(content);
   }
});

// Manejar el enfoque del editor
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

{#if isMobile || settingsController.state.showEditorToolbar}
   <div class="sticky top-0">
      <Toolbar editorInstance={editorInstance} />
   </div>
{/if}

<div
   bind:this={editorElement}
   role="document"
   class="prose prose-invert prose-neutral tiptap-editor"
   oncontextmenu={handleContextMenu}>
</div>
