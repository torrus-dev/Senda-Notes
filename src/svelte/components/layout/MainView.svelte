<script lang="ts">
import { noteController } from "@controllers/noteController.svelte";
import { settingsController } from "@controllers/settingsController.svelte";

import Sidebar from "./sidebar/Sidebar.svelte";
import NavBar from "./navbar/NavBar.svelte";
import Modal from "./Modal.svelte";
import NoteContent from "../noteContent/NoteContent.svelte";
import FloatingMenu from "../floatingMenu/FloatingMenu.svelte";

import type { Note } from "@projectTypes/noteTypes";

const activeNote: Note | undefined = $derived(noteController.getActiveNote());
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
            <NavBar note={activeNote} />
            {#if activeNote}
               <NoteContent note={activeNote} />
            {/if}
         </div>
      </main>
   </div>
</div>
