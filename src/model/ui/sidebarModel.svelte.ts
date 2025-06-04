const SIDEBAR_STORAGE_KEY = "Sidebar";

interface SidebarState {
   isOpen: boolean;
   width: number | null;
}

interface PersistedSidebarState {
   sidebar: SidebarState;
}

class SidebarModel {
   data: SidebarState = $state({
      isOpen: true,
      width: null,
   });

   constructor() {
      // Cargar estado persistido
      const loadedState = this.loadSidebarState();
      if (loadedState?.sidebar) {
         this.data = loadedState.sidebar;
      }

      // Auto-guardar cambios
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedSidebarState = {
               sidebar: this.data,
            };
            this.saveSidebarState(persistableState);
         });
      });
   }

   // Métodos de persistencia
   private serializeSidebarState(state: PersistedSidebarState): string {
      return JSON.stringify(state);
   }

   private deserializeSidebarState(
      serializedState: string,
   ): PersistedSidebarState {
      return JSON.parse(serializedState);
   }

   private saveSidebarState(
      state: PersistedSidebarState,
      storage: Storage = localStorage,
   ): PersistedSidebarState {
      const serialized = this.serializeSidebarState(state);
      storage.setItem(SIDEBAR_STORAGE_KEY, serialized);
      return state;
   }

   private loadSidebarState(
      storage: Storage = localStorage,
   ): PersistedSidebarState | null {
      const serialized = storage.getItem(SIDEBAR_STORAGE_KEY);
      return serialized ? this.deserializeSidebarState(serialized) : null;
   }

   // Getters y setters
   get isOpen() {
      return this.data.isOpen;
   }

   set isOpen(value: boolean) {
      this.data.isOpen = value;
   }

   get width() {
      return this.data.width;
   }

   set width(value: number | null) {
      this.data.width = value;
   }
}

export const sidebarModel = $state(new SidebarModel());
