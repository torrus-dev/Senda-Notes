import { noteNavigationModel } from "@model/navigation/noteNavigationModel.svelte";

class NoteNavigationController {
   getActiveNoteId() {
      return noteNavigationModel.activeNoteId;
   }

   setActiveNoteId(newId: string) {
      noteNavigationModel.previousActiveNoteId =
         noteNavigationModel.activeNoteId;
      noteNavigationModel.activeNoteId = newId;
   }

   unsetActiveNoteId() {
      noteNavigationModel.previousActiveNoteId =
         noteNavigationModel.activeNoteId;
      noteNavigationModel.activeNoteId = undefined;
   }

   getPreviousActiveNoteId() {
      return noteNavigationModel.previousActiveNoteId;
   }

   goToPreviousNote() {
      if (noteNavigationModel.previousActiveNoteId) {
         const temp = noteNavigationModel.activeNoteId;
         noteNavigationModel.activeNoteId =
            noteNavigationModel.previousActiveNoteId;
         noteNavigationModel.previousActiveNoteId = temp;
      }
   }

   hasActiveNote() {
      return noteNavigationModel.activeNoteId !== undefined;
   }

   hasPreviousNote() {
      return noteNavigationModel.previousActiveNoteId !== undefined;
   }

   // Getter para acceso directo al estado del modelo
   get state() {
      return noteNavigationModel.data;
   }
}

export const noteNavigationController = $state(new NoteNavigationController());
