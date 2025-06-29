import { noteNavigationModel } from "@model/navigation/noteNavigationModel.svelte";

class NoteNavigationController {
   get activeNoteId(): string | undefined {
      return noteNavigationModel.data.activeNoteId;
   }

   set activeNoteId(newId: string) {
      // Guardar el ID anterior antes de cambiar al nuevo
      noteNavigationModel.data.previousActiveNoteId =
         noteNavigationModel.data.activeNoteId;
      noteNavigationModel.data.activeNoteId = newId;
   }

   unsetActiveNoteId() {
      noteNavigationModel.data.previousActiveNoteId =
         noteNavigationModel.data.activeNoteId;
      noteNavigationModel.data.activeNoteId = undefined;
   }

   get previousActiveNoteId() {
      return noteNavigationModel.data.previousActiveNoteId;
   }
}

export const noteNavigationController = $state(new NoteNavigationController());
