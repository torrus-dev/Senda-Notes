<script lang="ts">
import Sidebar from "@components/sidebar/Sidebar.svelte";
import NavBar from "@components/navbar/NavBar.svelte";
import Modal from "@components/modals/Modal.svelte";
import NoteContent from "@components/note/NoteContent.svelte";
import FloatingMenu from "@components/floating/floatingMenu/FloatingMenu.svelte";

import type { Note } from "@projectTypes/core/noteTypes";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import Notifications from "@components/floating/notifications/Notifications.svelte";

import StatusBar from "@components/note/StatusBar.svelte";
import ConfirmationDialog from "./dialog/ConfirmationDialog.svelte";

const activeNote: Note | undefined = $derived(
   noteQueryController.getActiveNote(),
);
</script>

<div class="text-base-content bg-base-100">
   <!-- Componentes globales dinámicos o invisibles-->
   <Modal />
   <ConfirmationDialog />
   <FloatingMenu />
   <Notifications />

   <div
      class="text-base-content bg-base-100 grid h-screen grid-flow-col grid-cols-[min-content_1fr]">
      <Sidebar />

      <main>
         <div class="flex h-screen flex-col">
            <NavBar note={activeNote} />
            <NoteContent note={activeNote} />
            <StatusBar />
         </div>
      </main>
   </div>
</div>
