<style>
</style>

<script lang="ts">
import { onDestroy } from "svelte";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";

import { noteController } from "@controllers/note/noteController.svelte";
import { focusController } from "@controllers/focusController.svelte";
import { floatingMenuController } from "@controllers/floatingMenuController.svelte.js";
import { screenSizeController } from "@controllers/screenSizeController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";
import { CleanPasteExtension } from "@lib/editorExtensions/cleanPasteExtension";

import { getEditorContextMenuItems } from "@utils/editorMenuItems";
import Toolbar from "@components/note/editor/Toolbar.svelte";

import { FocusTarget } from "@projectTypes/focusTypes";
import type { Coordinates } from "@projectTypes/floatingTypes";
import { editorController } from "@controllers/editorController.svelte";

// Props
let { noteId, content = "" }: { noteId: string; content: string } = $props();

// Estado derivado
let isMobile: boolean = $derived(screenSizeController.isMobile);
let useDarkMode: boolean = $derived(settingsController.getTheme() === "dark");

// Referencias DOM y estado
let editorElement: HTMLElement;
let editorBox: { current: Editor | undefined } = $state.raw({
   current: undefined,
});

let currentNoteId: string | undefined = undefined;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY = 5000; // 5 segundos de retraso

function saveContentChanges() {
   if (editorBox.current && currentNoteId) {
      noteController.updateNoteContent(
         currentNoteId,
         editorBox.current.getHTML(),
      );
      // Indicar que el contenido está guardado
      editorController.contentSaved = true;
   }
}

// Función para manejar el guardado con retraso
function debouncedSave() {
   // Indicar que hay cambios sin guardar
   editorController.contentSaved = false;

   // Limpia el temporizador existente si hay uno
   if (saveTimer !== null) {
      clearTimeout(saveTimer);
   }

   // Configura un nuevo temporizador
   saveTimer = setTimeout(() => {
      saveContentChanges();
      saveTimer = null;
   }, SAVE_DELAY);
}

// Función para forzar el guardado inmediato (usado al destruir)
function forceSave() {
   if (saveTimer !== null) {
      clearTimeout(saveTimer);
      saveTimer = null;
   }
   saveContentChanges();
}

function getEditorStatistics(editor: Editor) {
   // Corregido: llamar a getText() como función
   const text = editor.getText();

   // Conteo de caracteres (excluir espacios en blanco al principio y final)
   editorController.chararecterCount = text.trim().length;

   // Conteo de líneas (filtrar líneas vacías)
   editorController.lineCount = text
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

   // Conteo de palabras (parece estar funcionando correctamente)
   editorController.wordCount = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
}

function initializeEditor(initialContent: string) {
   destroyEditor();

   const editor = new Editor({
      extensions: [
         StarterKit,
         TaskList,
         TaskItem.configure({ nested: true }),
         Highlight.configure({ multicolor: false }),
         Underline,
         CleanPasteExtension,
      ],
      editable: true,
      injectCSS: false,
      element: editorElement,
      content: initialContent,
      onUpdate: () => {
         // Reemplazamos el guardado inmediato con el guardado diferido
         debouncedSave();
      },
      onTransaction: () => {
         // Create a new object containing the editor to trigger reactivity
         editorBox = { current: editor };
         getEditorStatistics(editor);
      },
   });
   // Initialize the editor box
   editorBox = { current: editor };
   registerEditorWithFocusController();

   // Indicar que el contenido inicialmente está guardado
   editorController.contentSaved = true;
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
      editorBox.current = undefined;
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
      // Guardar contenido anterior si existe
      if (currentNoteId && editorBox.current) {
         forceSave();
      }
      currentNoteId = noteId;
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
   focusController.unregisterElement(FocusTarget.EDITOR);
   destroyEditor();
   // Forzar guardado al destruir para asegurar que nada se pierda
   forceSave();
});
</script>

{#if editorBox && editorBox.current}
   <div class="bg-base-100 sticky top-0">
      <div class="mx-auto w-full max-w-2xl">
         <Toolbar editorBox={{ current: editorBox.current }} />
      </div>
   </div>
{/if}
<div class="mx-auto my-4 w-full max-w-2xl">
   <div
      bind:this={editorElement}
      role="document"
      class="prose prose-neutral tiptap-editor h-full w-full break-words
      {useDarkMode ? 'prose-invert' : ''}"
      oncontextmenu={handleContextMenu}>
   </div>
</div>
