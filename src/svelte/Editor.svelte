<script>
  import { onMount, onDestroy } from "svelte";
  import EditorJS from "@editorjs/editorjs";
  import DragDrop from "editorjs-drag-drop";
  import { editorConfig } from "./editorConfig";

  let editor;

  const initEditor = () => {
    let data = JSON.parse(localStorage.getItem("articleData"));
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
      data: data || { blocks: [] },
      onChange: (api, event) => {
        editor
          .save()
          .then((outputData) => {
            localStorage.setItem("articleData", JSON.stringify(outputData));
          })
          .catch((error) => {
            console.log("Saving failed: ", error);
          });
      },
    });
  };

  onMount(initEditor);
  onDestroy(() => editor?.destroy());
</script>

<div id="editorjs"></div>

<style>
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
