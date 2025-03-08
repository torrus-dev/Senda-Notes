<script>
import { noteController } from "../../controllers/noteController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./NavBar.svelte";

import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";

const activeNote = $derived(noteController.getActiveNote());
</script>

<div
  class="text-base-content grid h-screen grid-flow-col grid-cols-[min-content_1fr] overflow-hidden bg-(--color-base-100)">
  <Sidebar></Sidebar>

  <main class="overflow-auto">
    <!-- Modal component -->
    <Modal />

    <!-- top bar -->
    <NavBar note={activeNote} />

    <NoteContent note={activeNote} />
  </main>
</div>
