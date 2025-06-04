interface NoteNavigationState {
   activeNoteId: string | undefined;
   previousActiveNoteId: string | undefined;
}

class NoteNavigationController {
   data: NoteNavigationState = $state({
      activeNoteId: undefined,
      previousActiveNoteId: undefined,
   });

   getActiveNoteId() {
      return this.data.activeNoteId;
   }

   setActiveNoteId(newId: string) {
      this.data.previousActiveNoteId = this.data.activeNoteId;
      this.data.activeNoteId = newId;
   }

   unsetActiveNoteId() {
      this.data.previousActiveNoteId = this.data.activeNoteId;
      this.data.activeNoteId = undefined;
   }

   getPreviousActiveNoteId() {
      return this.data.previousActiveNoteId;
   }

   goToPreviousNote() {
      if (this.data.previousActiveNoteId) {
         const temp = this.data.activeNoteId;
         this.data.activeNoteId = this.data.previousActiveNoteId;
         this.data.previousActiveNoteId = temp;
      }
   }

   hasActiveNote() {
      return this.data.activeNoteId !== undefined;
   }

   hasPreviousNote() {
      return this.data.previousActiveNoteId !== undefined;
   }

   // Getter para acceso directo al estado
   get state() {
      return this.data;
   }
}

export const noteNavigationController = $state(new NoteNavigationController());
