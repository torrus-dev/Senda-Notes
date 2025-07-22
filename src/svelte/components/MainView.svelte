<script lang="ts">
import Sidebar from "@components/sidebar/Sidebar.svelte";
import NavBar from "@components/navbar/NavBar.svelte";
import Modal from "@components/modals/Modal.svelte";
import FloatingMenu from "@components/floating/floatingMenu/FloatingMenu.svelte";
import Notifications from "@components/floating/notifications/Notifications.svelte";
import StatusBar from "@components/note/StatusBar.svelte";
import ConfirmationDialog from "@components/dialog/ConfirmationDialog.svelte";
import TabBar from "@components/workspace/tabs/TabBar.svelte";

import { searchController } from "@controllers/navigation/searchController.svelte";
import NotPanel from "./workspace/NotePanel.svelte";
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
            <!-- Navbar -->
            <NavBar />
            <!-- Tabbar -->
            <TabBar />
            <!-- Contenedor principal -->
            <!-- overlay to dimm when searching -->
            <div
               class="h-full overflow-auto
   {searchController.isSearching ? 'overflow-hidden filter' : ''}">
               <article class="relative h-full py-4">
                  {#if searchController.isSearching}
                     <div
                        class="bg-base-100/60 absolute top-0 left-0 z-90 h-full w-full">
                     </div>
                  {/if}
                  <NotPanel />
               </article>
            </div>

            <StatusBar />
         </div>
      </main>
   </div>
</div>
