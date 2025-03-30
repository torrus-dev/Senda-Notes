<script>
import { noteController } from "@controllers/noteController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./NavBar.svelte";
import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";
import FloatingMenu from "../menu/FloatingMenu.svelte";

const activeNote = $derived(noteController.getActiveNote());
console.log("theme", settingsController.theme);
</script>

<div
   class="text-base-content bg-base-100
  {settingsController.getTheme() === 'dark' ? 'theme-dark' : 'theme-light'}">
   <Modal />
   <FloatingMenu />
   <div
      class="text-base-content bg-base-100 grid h-screen grid-flow-col grid-cols-[min-content_1fr]">
      <Sidebar />

      <main>
         <div class="flex h-screen flex-col">
            <!-- top bar -->
            <NavBar note={activeNote} />

            <NoteContent note={activeNote} />
         </div>
      </main>
   </div>
</div>
