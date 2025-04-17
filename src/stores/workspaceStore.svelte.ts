import type {
   WorkspaceState,
   PersistedWorkspaceState,
} from "@projectTypes/workspaceTypes";
import { loadWorkspaceState, saveWorkspaceState } from "@utils/storage";
import { noteStore } from "@stores/noteStore.svelte";

class WorkspaceStore {
   data: WorkspaceState = $state({
      activeNoteId: undefined,
      previousActiveNoteId: undefined,
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
         notesCollapsed: false,
      },
      editor: {
         metadataCollapsed: false,
         propertiesCollapsed: false,
         childrenCollapsed: false,
      },
   });

   constructor() {
      // Cargamos solo el estado persistente
      const loadedPersistedState =
         loadWorkspaceState() as PersistedWorkspaceState | null;
      if (loadedPersistedState && loadedPersistedState.sidebar) {
         this.data.sidebar = loadedPersistedState.sidebar;
      }

      // Guardamos únicamente la parte persistente (sidebar)
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedWorkspaceState = {
               sidebar: this.data.sidebar,
               editor: this.data.editor,
            };
            saveWorkspaceState(persistableState);
         });
      });

      // Configurar un efecto para monitorear cambios en activeNoteId
      $effect.root(() => {
         $effect(() => {
            const currentActiveId = this.data.activeNoteId;

            // Si había una nota activa anterior, guardar cualquier cambio pendiente
            if (
               this.data.previousActiveNoteId &&
               this.data.previousActiveNoteId !== currentActiveId
            ) {
               noteStore.saveContentForNote(this.data.previousActiveNoteId);
            }

            // Actualizar el seguimiento de la nota activa
            this.data.previousActiveNoteId = currentActiveId;
         });
      });
   }

   get propertyEditor() {
      return this.data.propertyEditor;
   }

   set propertyEditor(value) {
      this.data.propertyEditor = value;
   }

   get windows() {
      return this.data.windows;
   }

   set windows(value) {
      this.data.windows = value;
   }

   get activeWindowId() {
      return this.data.activeWindowId;
   }

   set activeWindowId(value) {
      this.data.activeWindowId = value;
   }

   get modal() {
      return this.data.modal;
   }

   set modal(value) {
      this.data.modal = value;
   }

   get sidebar() {
      return this.data.sidebar;
   }

   set sidebar(value) {
      this.data.sidebar = value;
   }

   get activeNoteId() {
      return this.data.activeNoteId;
   }

   set activeNoteId(value) {
      this.data.activeNoteId = value;
   }

   get previousActiveNoteId() {
      return this.data.previousActiveNoteId;
   }

   set previousActiveNoteId(value) {
      this.data.previousActiveNoteId = value;
   }

   get editor() {
      return this.data.editor;
   }

   set editor(value) {
      this.data.editor = value;
   }
   
}
export let workspaceStore = $state(new WorkspaceStore());
