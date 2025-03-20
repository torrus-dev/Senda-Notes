<script>
import { noteController } from "../../controllers/noteController.svelte";
import {
  contextMenuController,
  subMenuController,
} from "../../controllers/contextMenuController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./NavBar.svelte";
import Menu from "./Menu.svelte";
import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";
import { settingsController } from "../../controllers/settingsController.svelte";

const activeNote = $derived(noteController.getActiveNote());
</script>

<div
  class="text-base-content bg-base-100
  {settingsController.theme === 'dark' ? 'theme-dark' : 'theme-light'}">
  <!-- Modal component -->
  <Modal />
  <!-- ContextMenu component -->
  <Menu menuController={contextMenuController} />
  <!-- SubMenu component -->
  <Menu menuController={subMenuController} />

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
