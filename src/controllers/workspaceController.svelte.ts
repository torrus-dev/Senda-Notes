import type {
   WorkspaceState,
   PersistedWorkspaceState,
} from "@projectTypes/workspaceTypes";
import { loadWorkspaceState, saveWorkspaceState } from "@utils/storage";
import { Component } from "svelte";
import { noteController } from "./noteController.svelte";

class WorkspaceController {
   // Estado global del workspace: incluye propiedades efímeras y la persistente.
   state = $state<WorkspaceState>({
      propertyEditor: {
         isOpen: false,
         noteId: null,
         propertyId: null,
      },
      windows: [],
      activeWindowId: null,
      modal: {
         isOpen: false,
         content: undefined,
      },
      sidebar: {
         isOpen: true,
         width: null,
      },
      activeNoteId: undefined,
      previousActiveNoteId: undefined,
   });

   constructor() {
      // Cargamos solo el estado persistente
      const loadedPersistedState =
         loadWorkspaceState() as PersistedWorkspaceState | null;
      if (loadedPersistedState && loadedPersistedState.sidebar) {
         this.state.sidebar = loadedPersistedState.sidebar;
      }

      // Guardamos únicamente la parte persistente (sidebar)
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedWorkspaceState = {
               sidebar: this.state.sidebar,
            };
            saveWorkspaceState(persistableState);
         });
      });

      // Configurar un efecto para monitorear cambios en activeNoteId
      $effect.root(() => {
         $effect(() => {
            const currentActiveId = this.state.activeNoteId;

            // Si había una nota activa anterior, guardar cualquier cambio pendiente
            if (
               this.state.previousActiveNoteId &&
               this.state.previousActiveNoteId !== currentActiveId
            ) {
               noteController.saveContentForNote(
                  this.state.previousActiveNoteId,
               );
            }

            // Actualizar el seguimiento de la nota activa
            this.state.previousActiveNoteId = currentActiveId;
         });
      });
   }

   // ---------- Sidebar ----------
   getActiveNoteId = () => this.state.activeNoteId;
   setActiveNoteId = (newId: string) => {
      this.state.previousActiveNoteId = this.state.activeNoteId;
      this.state.activeNoteId = newId;
   };
   unsetActiveNoteId = () => {
      this.state.previousActiveNoteId = this.state.activeNoteId;
      this.state.activeNoteId = undefined;
   };

   // ---------- Modal ----------
   openModal = (modalContent: Component | undefined = undefined) => {
      this.state.modal = {
         isOpen: true,
         content: modalContent,
      };
   };

   closeModal = () => {
      this.state.modal = {
         isOpen: false,
         content: undefined,
      };
   };

   isModalOpen = () => {
      return this.state.modal.isOpen;
   };

   getModalContent = () => {
      return this.state.modal.content;
   };

   // ---------- Sidebar ----------
   setSidebarWidth = (newWidth: number) => {
      if (typeof newWidth === "number") {
         this.state.sidebar.width = newWidth;
      }
   };

   getSidebarWidth = () => {
      return this.state.sidebar.width;
   };

   toggleSidebar = () => {
      this.state.sidebar.isOpen = !this.state.sidebar.isOpen;
   };

   closeSidebar = () => {
      this.state.sidebar.isOpen = false;
   };

   isSidebarOpen = () => {
      return this.state.sidebar.isOpen;
   };

   // ---------- Property Editor ----------
   openPropertyEditor = (
      noteId: string | null = null,
      propertyId: string | null = null,
   ) => {
      this.state.propertyEditor = {
         isOpen: true,
         noteId: noteId,
         propertyId: propertyId,
      };
   };

   closePropertyEditor = () => {
      this.state.propertyEditor = {
         isOpen: false,
         noteId: null,
         propertyId: null,
      };
   };

   isOpenPropertyEditor = (
      noteId: string | null = null,
      propertyId: string | null = null,
   ) => {
      return (
         this.state.propertyEditor.isOpen &&
         this.state.propertyEditor.noteId === noteId &&
         this.state.propertyEditor.propertyId === propertyId
      );
   };
}

export const workspace = $state(new WorkspaceController());
