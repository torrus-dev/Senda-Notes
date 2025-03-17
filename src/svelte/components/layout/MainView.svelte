<script>
import { noteController } from "../../controllers/noteController.svelte";
import { workspace } from "../../controllers/workspaceController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./NavBar.svelte";
import ContextMenu from "./ContextMenu.svelte";
import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";

const activeNote = $derived(noteController.getActiveNote());
</script>

<div
  class="text-base-content bg-base-100
  {workspace.theme === 'dark' ? 'theme-dark' : 'theme-light'}">
  <!-- Modal component -->
  <Modal />
  <!-- ContextMenu component -->
  <ContextMenu />
  <div
    class="text-base-content bg-base-100 grid h-screen grid-flow-col grid-cols-[min-content_1fr]">
    <Sidebar></Sidebar>

    <main>
      <div class="flex h-screen flex-col">
        <!-- top bar -->
        <NavBar note={activeNote} />

        <NoteContent note={activeNote} />
      </div>
    </main>
  </div>
</div>
