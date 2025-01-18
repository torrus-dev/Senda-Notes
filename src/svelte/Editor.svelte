<script>
  import { onMount, onDestroy } from "svelte";
  import EditorJS from "@editorjs/editorjs";
  import DragDrop from "editorjs-drag-drop";
  import { editorConfig } from "./editorConfig";
  import { currentNote, notes, updateNote } from "./noteController";

  let editor;
  let currentNoteId = null;

  const initEditor = (noteContent = null) => {
    if (editor && typeof editor.destroy === "function") {
      editor.destroy();
    }

    editor = new EditorJS({
      holder: "editorjs",
      tools: editorConfig,
      autofocus: true,
      inlineToolbar: ["bold", "italic", "link", "marker", "inlineCode"],
      dragDrop: true,
      onReady: () => {
        new DragDrop(editor);
      },
      defaultBlock: "paragraph",
      enableMovingByArrowKeys: true,
      data: noteContent ? JSON.parse(noteContent) : { blocks: [] },
      onChange: async () => {
        try {
          const outputData = await editor.save();
          if (currentNoteId) {
            updateNote(currentNoteId, {
              content: JSON.stringify(outputData),
            });
          }
        } catch (error) {
          console.log("Saving failed: ", error);
        }
      },
    });
  };

  currentNote.subscribe((note) => {
    if (note) {
      currentNoteId = note.id;
      if (note.content !== editor?.save()) {
        initEditor(note.content || null);
      }
    } else {
      currentNoteId = null;
      initEditor(null);
    }
  });

  onMount(() => {
    const note = $currentNote;
    initEditor(note?.content || null);
  });

  onDestroy(() => {
    if (editor && typeof editor.destroy === "function") {
      editor.destroy();
    }
  });
</script>

<div id="editorjs" class:disabled={!$currentNote}></div>

<style>
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  :global(.codex-editor),
  :global(.ce-block),
  :global(.ce-toolbar__content) {
    max-width: 100% !important;
    width: 100% !important;
  }

  :global(.ce-block__content) {
    max-width: 100% !important;
    margin: 0 auto;
    position: relative;
  }

  :global(.ce-paragraph),
  :global(.ce-header),
  :global(.cdx-list) {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  :global(.ce-block--dragging) {
    opacity: 0.5;
    pointer-events: none;
  }

  :global(.ce-block--dropped) {
    animation: dropAnimation 0.3s ease;
  }

  @keyframes dropAnimation {
    from {
      opacity: 0.5;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
