import { FocusTarget } from "@projectTypes/ui/uiTypes";
import type { Note, NoteStats } from "@projectTypes/core/noteTypes";

import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";
import { DateTime } from "luxon";

import { focusController } from "@controllers/ui/focusController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { notePathController } from "@controllers/notes/notePathController.svelte";
import { notificationController } from "@controllers/application/notificationController.svelte";
import { globalConfirmationDialog } from "@controllers/menu/confirmationDialogController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";

import { startupManager } from "@model/startup/startupManager.svelte";
import { NoteModel } from "@model/notes/noteModel.svelte";

/**
 * Controlador principal de notas
 * Se enfoca en operaciones CRUD básicas y coordinación con otros controladores
 */
class NoteController {
   private get noteModel(): NoteModel {
      return startupManager.getModel("noteModel");
   }
   setAllNotes = this.noteModel.setAllNotes.bind(this.noteModel);

   // === FUNCIONES PÚBLICAS DE CREACIÓN ===

   /**
    * Crea notas desde un path jerárquico como "proyecto/backend/auth"
    * Delega la lógica de paths al controlador especializado
    */
   createNoteFromPath = (path: string): string | null => {
      const targetNoteId = notePathController.createNoteFromPath(path);

      if (targetNoteId) {
         this.openAndFocusNote(targetNoteId);
      }

      return targetNoteId;
   };

   createNote = (parentId?: string, noteParts?: Partial<Note>): void => {
      if (parentId && !noteQueryController.validateParentExists(parentId))
         return;

      const noteId = this.createSingleNote(parentId, noteParts);

      if (noteId) {
         this.openAndFocusNote(noteId);
      }
   };

   // === CREACIÓN DE NOTAS ===

   /**
    * Crea una sola nota con los parámetros especificados
    * Método público para ser usado por otros controladores
    */
   createSingleNote(
      parentId?: string,
      noteParts?: Partial<Note>,
   ): string | null {
      try {
         const newNote: Note = this.buildNoteObject(parentId, noteParts);

         this.noteModel.createNote(newNote);
         this.updateParentChildren(parentId, newNote.id);

         return newNote.id;
      } catch (error) {
         console.error("Error creating note:", error);
         return null;
      }
   }

   private buildNoteObject(parentId?: string, noteParts?: Partial<Note>): Note {
      return {
         id: noteParts?.id ?? crypto.randomUUID(),
         title: generateUniqueTitle(
            this.noteModel.getAllNotes(),
            noteParts?.title,
         ),
         children: noteParts?.children ?? [],
         content: noteParts?.content ?? "",
         metadata: noteParts?.metadata ?? createDefaultMetadata(),
         properties: noteParts?.properties ?? [],
         parentId: parentId ?? noteParts?.parentId,
         icon: noteParts?.icon,
         stats: noteParts?.stats,
      };
   }

   private updateParentChildren(
      parentId: string | undefined,
      childId: string,
   ): void {
      if (!parentId) return;

      this.noteModel.updateNote(parentId, (parent) => ({
         ...parent,
         children: [...parent.children, childId],
      }));
   }

   // === FUNCIONES DE ACTUALIZACIÓN ===

   updateNote = (noteId: string, updates: Partial<Note>): void => {
      if (!noteQueryController.getNoteById(noteId)) {
         console.error(`Note with id ${noteId} not found`);
         return;
      }

      this.noteModel.updateNote(noteId, (note) => ({ ...note, ...updates }));
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

   updateNoteStats = (noteId: string, stats: NoteStats): void => {
      this.updateNote(noteId, { stats });
   };

   updateNoteContentWithStats = (
      noteId: string,
      content: string,
      stats: NoteStats,
   ): void => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;

      this.updateNote(noteId, {
         content,
         stats,
         metadata: {
            ...note.metadata,
            modified: DateTime.now(),
         },
      });
   };

   // === FUNCIONES DE ELIMINACIÓN ===

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
      const idsToDelete = noteQueryController.getDescendantIds(id);
      idsToDelete.add(id);

      // Batch update: eliminar notas y limpiar referencias en una sola operación
      this.noteModel.updateAllNotes((notes) => {
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
      const activeNoteId = workspaceController.activeNoteId;
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspaceController.closeTabByTabId(activeNoteId);
      }

      notificationController.addNotification({
         message: `Nota "${noteToDelete.title}" eliminada.`,
         type: "base",
      });
   };

   // === FUNCIONES AUXILIARES ===

   private openAndFocusNote(noteId: string): void {
      workspaceController.openNote(noteId);
      focusController.requestFocus(FocusTarget.TITLE);
   }
}

let instance: NoteController | null = null;

export const noteController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new NoteController();
         const value = instance[prop as keyof NoteController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as NoteController;
