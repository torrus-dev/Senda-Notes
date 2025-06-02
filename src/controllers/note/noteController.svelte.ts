import { FocusTarget } from "@projectTypes/focusTypes";
import type { Note } from "@projectTypes/noteTypes";

import { noteModel } from "@model/noteModel.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";

import { focusController } from "@controllers/focusController.svelte";
import { noteTreeController } from "@controllers/note/noteTreeController.svelte";
import { noteQueryController } from "@controllers/note/noteQueryController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";
import { notificationController } from "@controllers/notificationController.svelte";
import { globalConfirmationDialog } from "@controllers/ui/confirmationDialogController.svelte";

class NoteController {
   setAllNotes = noteModel.setAllNotes.bind(noteModel);

   createNote = (parentId?: string): void => {
      // Validación previa si hay padre
      if (parentId && !noteQueryController.getNoteById(parentId)) {
         console.error(`Parent note with id ${parentId} not found`);
         return;
      }

      const newNote: Note = {
         id: crypto.randomUUID(),
         title: generateUniqueTitle(noteModel.getAllNotes()),
         children: [],
         content: "",
         metadata: createDefaultMetadata(),
         properties: [],
         parentId,
      };

      // Añadir la nueva nota
      noteModel.createNote(newNote);

      // Si tiene padre, actualizar su array children
      if (parentId) {
         noteModel.updateNote(parentId, (parent) => ({
            ...parent,
            children: [...parent.children, newNote.id],
         }));
      }

      workspace.setActiveNoteId(newNote.id);
      focusController.requestFocus(FocusTarget.TITLE);
   };

   updateNote = (noteId: string, updates: Partial<Note>): void => {
      if (!noteQueryController.getNoteById(noteId)) {
         console.error(`Note with id ${noteId} not found`);
         return;
      }

      noteModel.updateNote(noteId, (note) => ({ ...note, ...updates }));
   };

   updateNoteTitle = (noteId: string, title: string): void => {
      const sanitizedTitle = sanitizeTitle(title);
      const note = noteQueryController.getNoteById(noteId);

      if (note && note.title !== sanitizedTitle) {
         this.updateNote(noteId, { title: sanitizedTitle });
      }
   };

   updateNoteIcon = (noteId: string, icon?: string): void => {
      this.updateNote(noteId, { icon });
   };

   updateNoteContent = (noteId: string, content: string): void => {
      this.updateNote(noteId, { content });
   };

   deleteNoteWithConfirmation = (id: string): void => {
      const note = noteQueryController.getNoteById(id);
      if (!note) return;

      globalConfirmationDialog.show({
         title: "Borrar Nota",
         message:
            "¿Seguro que quieres borrar esta nota? Esta acción no puede deshacerse.",
         variant: "danger",
         onAccept: () => this.deleteNote(id),
      });
   };

   deleteNote = (id: string): void => {
      const noteToDelete = noteQueryController.getNoteById(id);
      if (!noteToDelete) return;

      // Obtener todos los IDs a eliminar (nota + descendientes)
      const idsToDelete = noteTreeController.getDescendantIds(id);
      idsToDelete.add(id);

      // Batch update: eliminar notas y limpiar referencias en una sola operación
      noteModel.updateAllNotes((notes) => {
         // Filtrar notas eliminadas
         const remainingNotes = notes.filter(
            (note) => !idsToDelete.has(note.id),
         );

         // Limpiar referencias en children arrays
         return remainingNotes.map((note) => {
            const hasDeletedChildren = note.children.some((childId) =>
               idsToDelete.has(childId),
            );

            return hasDeletedChildren
               ? updateModifiedMetadata({
                    ...note,
                    children: note.children.filter(
                       (childId) => !idsToDelete.has(childId),
                    ),
                 })
               : note;
         });
      });

      // Limpiar nota activa si fue eliminada
      const activeNoteId = workspace.getActiveNoteId();
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspace.unsetActiveNoteId();
      }

      notificationController.addNotification({
         message: `Nota "${noteToDelete.title}" eliminada.`,
         type: "base",
      });
   };
}

export const noteController = new NoteController();
