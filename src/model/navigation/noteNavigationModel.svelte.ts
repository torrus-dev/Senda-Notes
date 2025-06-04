const NOTE_NAVIGATION_STORAGE_KEY = "NoteNavigation";

interface NoteNavigationState {
   activeNoteId: string | undefined;
   previousActiveNoteId: string | undefined;
}

interface PersistedNoteNavigationState {
   noteNavigation: NoteNavigationState;
}

class NoteNavigationModel {
   data: NoteNavigationState = $state({
      activeNoteId: undefined,
      previousActiveNoteId: undefined,
   });

   constructor() {
      // Cargar estado persistido
      const loadedState = this.loadNoteNavigationState();
      if (loadedState?.noteNavigation) {
         this.data = loadedState.noteNavigation;
      }

      // Auto-guardar cambios
      $effect.root(() => {
         $effect(() => {
            const persistableState: PersistedNoteNavigationState = {
               noteNavigation: this.data,
            };
            this.saveNoteNavigationState(persistableState);
         });
      });
   }

   // Métodos de persistencia
   private serializeNoteNavigationState(
      state: PersistedNoteNavigationState,
   ): string {
      return JSON.stringify(state);
   }

   private deserializeNoteNavigationState(
      serializedState: string,
   ): PersistedNoteNavigationState {
      return JSON.parse(serializedState);
   }

   private saveNoteNavigationState(
      state: PersistedNoteNavigationState,
      storage: Storage = localStorage,
   ): PersistedNoteNavigationState {
      const serialized = this.serializeNoteNavigationState(state);
      storage.setItem(NOTE_NAVIGATION_STORAGE_KEY, serialized);
      return state;
   }

   private loadNoteNavigationState(
      storage: Storage = localStorage,
   ): PersistedNoteNavigationState | null {
      const serialized = storage.getItem(NOTE_NAVIGATION_STORAGE_KEY);
      return serialized
         ? this.deserializeNoteNavigationState(serialized)
         : null;
   }

   // Getters y setters
   get activeNoteId() {
      return this.data.activeNoteId;
   }

   set activeNoteId(value: string | undefined) {
      this.data.activeNoteId = value;
   }

   get previousActiveNoteId() {
      return this.data.previousActiveNoteId;
   }

   set previousActiveNoteId(value: string | undefined) {
      this.data.previousActiveNoteId = value;
   }
}

export const noteNavigationModel = $state(new NoteNavigationModel());
