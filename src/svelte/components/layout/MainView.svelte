<script>
import { noteController } from "../../controllers/noteController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./NavBar.svelte";
import ContextMenu from "./ContextMenu.svelte";
import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";
import { contextMenu } from "../../../directives/contextMenu.svelte";

const activeNote = $derived(noteController.getActiveNote());

const contextMenuItems = [
  {
    label: "Rename Note",
    onClick: () => {
      focusController.requestFocus(FocusTarget.TITLE);
    },
  },
  {
    label: "Delete Note",
    onClick: () => noteController.deleteNote(note.id),
    class: "text-error",
  },
];
</script>

<div
  class="text-base-content grid h-screen grid-flow-col grid-cols-[min-content_1fr] overflow-hidden bg-(--color-base-100)"
  use:contextMenu={contextMenuItems}>
  <Sidebar></Sidebar>

  <main class="overflow-auto">
    <!-- Modal component -->
    <Modal />

    <!-- ContextMenu component -->
    <ContextMenu />

    <!-- top bar -->
    <NavBar note={activeNote} />

    <NoteContent note={activeNote} />
  </main>
</div>
