import type {
   WorkspaceState,
   PersistedWorkspaceState,
} from "@projectTypes/workspaceTypes";
import { loadWorkspaceState, saveWorkspaceState } from "@utils/storage";

class WorkspaceStore {
   data: WorkspaceState = $state({
      activeNoteId: undefined,
      previousActiveNoteId: undefined,
      propertyEditor: {
         isOpen: false,
         noteId: undefined,
         propertyId: undefined,
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
      collapsible: {
         notesCollapsed: false,
         childrenCollapsed: false,
         metadataCollapsed: false,
         propertiesCollapsed: false,
      },
   });

   constructor() {
      // Cargamos solo el estado persistente
      const loadedPersistedState =
         loadWorkspaceState() as PersistedWorkspaceState | null;
      if (loadedPersistedState && loadedPersistedState.sidebar) {
         this.data.sidebar = loadedPersistedState.sidebar;
         this.data.collapsible = loadedPersistedState.collapsible;
      }

      // Guardamos únicamente la parte persistente (sidebar)
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedWorkspaceState = {
               sidebar: this.data.sidebar,
               collapsible: this.data.collapsible,
            };
            saveWorkspaceState(persistableState);
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

   get collapsible() {
      return this.data.collapsible;
   }

   set collapsible(value) {
      this.data.collapsible = value;
   }
}
export let workspaceStore = $state(new WorkspaceStore());
