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
import Underline from "@tiptap/extension-underline";

import { noteController } from "@controllers/noteController.svelte";
import { focusController } from "@controllers/focusController.svelte";

import { floatingMenuController } from "@controllers/floatingMenuController.svelte.js";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import Toolbar from "../Toolbar.svelte";

import { FocusTarget } from "@projectTypes/focusTypes";
import type { Coordinates } from "@projectTypes/floatingMenuTypes";
import { getEditorContextMenuItems } from "@utils/editorMenuItems";

// Props
let { noteId = null, content = "" } = $props();

// Estado derivado
let isMobile: boolean = $derived(screenSizeController.isMobile);

// Referencias DOM y estado
let editorElement: HTMLElement;
let editorBox: { current: Editor | null } = $state.raw({ current: null });

let currentNoteId: string | null = null;

function initializeEditor(initialContent: string) {
   destroyEditor();

   const editor = new Editor({
      extensions: [
         StarterKit,
         TaskList,
         TaskItem.configure({ nested: true }),
         Highlight.configure({ multicolor: false }),
         Underline,
      ],
      autofocus: true,
      editable: true,
      injectCSS: false,
      element: editorElement,
      content: initialContent,
      onUpdate: ({ editor }) => {
         if (noteId) {
            noteController.updateNote(noteId, { content: editor.getHTML() });
         }
      },
      onTransaction: () => {
         // Create a new object containing the editor to trigger reactivity
         editorBox = { current: editor };
      },
   });
   // Initialize the editor box
   editorBox = { current: editor };
   registerEditorWithFocusController();
}

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

function destroyEditor() {
   if (editorBox.current) {
      editorBox.current.destroy();
      editorBox.current = null;
   }
}

function handleContextMenu(event: MouseEvent) {
   event.preventDefault();

   if (!editorBox.current) return;

   const { clientX, clientY } = event;
   const editorPosition = editorBox.current.view.posAtCoords({
      left: clientX,
      top: clientY,
   });

   if (!editorPosition) return;

   const coordinates: Coordinates = { x: clientX, y: clientY };
   if (editorBox.current) {
      floatingMenuController.openContextMenu(
         coordinates,
         getEditorContextMenuItems({ current: editorBox.current }),
      );
   }
}

// Inicializar editor cuando cambia la nota activa
$effect(() => {
   if (noteId !== currentNoteId) {
      currentNoteId = noteId;
      noteController.forceImmediateSave();
      initializeEditor(content);
   }
});

// Manejar el enfoque del editor
$effect(() => {
   if (
      focusController.focus?.targetId === FocusTarget.EDITOR &&
      editorBox.current
   ) {
      editorBox.current.commands.focus();
   }
});

// Limpieza al destruir el componente
onDestroy(() => {
   noteController.forceImmediateSave();
   focusController.unregisterElement(FocusTarget.EDITOR);
   destroyEditor();
});
</script>

{#if editorBox.current && (isMobile || settingsController.state.showEditorToolbar)}
   <div class="bg-base-100 sticky top-0">
      <div class="mx-auto w-full max-w-2xl">
         {noteController.isDataSaved ? "Guardado" : "Sin Guardar"}
         <Toolbar editorBox={editorBox} />
      </div>
   </div>
{/if}

<div class="mx-auto my-4 w-full max-w-2xl">
   <div
      bind:this={editorElement}
      role="document"
      class="prose prose-invert prose-neutral tiptap-editor w-full"
      oncontextmenu={handleContextMenu}>
   </div>
</div>
