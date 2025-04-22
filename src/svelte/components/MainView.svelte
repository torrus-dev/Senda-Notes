<script lang="ts">
import { settingsController } from "@controllers/settingsController.svelte";

import Sidebar from "@components/sidebar/Sidebar.svelte";
import NavBar from "@components/navbar/NavBar.svelte";
import Modal from "@components/modals/Modal.svelte";
import NoteContent from "@components/noteView/NoteContent.svelte";
import FloatingMenu from "@components/floating/floatingMenu/FloatingMenu.svelte";

import type { Note } from "@projectTypes/noteTypes";
import { noteQueryController } from "@controllers/noteQueryController.svelte";
import Notifications from "@components/floating/notifications/Notifications.svelte";

import StatusBar from "@components/noteView/StatusBar.svelte";

const activeNote: Note | undefined = $derived(
   noteQueryController.getActiveNote(),
);
</script>

<div
   class="text-base-content bg-base-100
  {settingsController.getTheme() === 'dark' ? 'theme-dark' : 'theme-light'}">
   <Modal />
   <FloatingMenu />
   <Notifications />
   <div
      class="text-base-content bg-base-100 grid h-screen grid-flow-col grid-cols-[min-content_1fr]">
      <Sidebar />

      <main>
         <div class="flex h-screen flex-col">
            <NavBar note={activeNote} />
            <NoteContent note={activeNote} />
            {#if activeNote}
            {/if}
            <StatusBar />
         </div>
      </main>
   </div>
</div>
