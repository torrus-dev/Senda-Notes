import type {
   WorkspaceState,
   PersistedWorkspaceState,
} from "@projectTypes/workspaceTypes";

const WORKSPACE_STORAGE_KEY = "Workspace";

class WorkspaceModel {
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
   });

   constructor() {
      // Cargamos solo el estado persistente
      const loadedPersistedState = this.loadWorkspaceState();
      if (loadedPersistedState && loadedPersistedState.sidebar) {
         this.data.sidebar = loadedPersistedState.sidebar;
      }

      // Guardamos únicamente la parte persistente (sidebar)
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedWorkspaceState = {
               sidebar: this.data.sidebar,
            };
            this.saveWorkspaceState(persistableState);
         });
      });
   }

   // Funciones de storage integradas
   private serializeWorkspaceState(state: PersistedWorkspaceState): string {
      return JSON.stringify(state);
   }

   private deserializeWorkspaceState(
      serializedState: string,
   ): PersistedWorkspaceState {
      return JSON.parse(serializedState);
   }

   private saveWorkspaceState(
      state: PersistedWorkspaceState,
      storage: Storage = localStorage,
   ): PersistedWorkspaceState {
      const serialized = this.serializeWorkspaceState(state);
      storage.setItem(WORKSPACE_STORAGE_KEY, serialized);
      return state;
   }

   private loadWorkspaceState(
      storage: Storage = localStorage,
   ): PersistedWorkspaceState | null {
      const serialized = storage.getItem(WORKSPACE_STORAGE_KEY);
      return serialized ? this.deserializeWorkspaceState(serialized) : null;
   }

   // Getters y setters
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
}

export let workspaceModel = $state(new WorkspaceModel());
