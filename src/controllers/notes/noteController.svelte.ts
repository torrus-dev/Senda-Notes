import { FocusTarget } from "@projectTypes/ui/uiTypes";
import type { Note, NoteStats } from "@projectTypes/core/noteTypes";

import { noteModel } from "@model/notes/noteModel.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";
import { DateTime } from "luxon";

import { focusController } from "@controllers/ui/focusController.svelte";
import { noteTreeController } from "@controllers/notes/noteTreeController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { notificationController } from "@controllers/application/notificationController.svelte";
import { globalConfirmationDialog } from "@controllers/menu/confirmationDialogController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { normalizeText } from "@utils/searchUtils";

// Tipos simplificados
interface PathResolution {
   existingNotes: Note[];
   missingSegments: string[];
   lastParentId?: string;
}

class NoteController {
   setAllNotes = noteModel.setAllNotes.bind(noteModel);

   // === FUNCIONES PÚBLICAS ===

   /**
    * Crea notas desde un path jerárquico como "proyecto/backend/auth"
    */
   createNoteFromPath = (path: string): string | null => {
      try {
         const segments = this.parseNotePath(path);
         if (!segments.length) return null;

         const resolution = this.resolveNotePath(segments);
         const targetNoteId = this.executeNoteCreation(resolution, segments);

         if (targetNoteId) {
            this.openAndFocusNote(targetNoteId);
         }

         return targetNoteId;
      } catch (error) {
         console.error("Error creating note from path:", error);
         return null;
      }
   };

   /**
    * Función legacy para compatibilidad
    */
   createNote = (parentId?: string, noteParts?: Partial<Note>): void => {
      if (parentId && !this.validateParentExists(parentId)) return;

      const noteId = this.createSingleNote(parentId, noteParts);

      if (noteId) {
         this.openAndFocusNote(noteId);
      }
   };

   // === LÓGICA DE PATHS ===

   private parseNotePath(path: string): string[] {
      if (!path?.trim()) return [];

      return path
         .split("/")
         .map((segment) => sanitizeTitle(segment.trim()))
         .filter(Boolean);
   }

   private resolveNotePath(segments: string[]): PathResolution {
      const resolution: PathResolution = {
         existingNotes: [],
         missingSegments: [],
         lastParentId: undefined,
      };

      let currentParentId: string | undefined;

      for (const segment of segments) {
         const existingNote = this.findNoteByTitleAndParent(
            segment,
            currentParentId,
         );

         if (existingNote) {
            resolution.existingNotes.push(existingNote);
            currentParentId = existingNote.id;
         } else {
            // Primer segmento faltante - guardar resto y salir
            const currentIndex = resolution.existingNotes.length;
            resolution.missingSegments = segments.slice(currentIndex);
            resolution.lastParentId = currentParentId;
            break;
         }
      }

      return resolution;
   }

   private executeNoteCreation(
      resolution: PathResolution,
      originalSegments: string[],
   ): string | null {
      if (!resolution.missingSegments.length) {
         // Todas las notas existen - retornar la última
         return (
            resolution.existingNotes[resolution.existingNotes.length - 1]?.id ||
            null
         );
      }

      return this.createMissingNotes(resolution);
   }

   private createMissingNotes(resolution: PathResolution): string | null {
      let currentParentId = resolution.lastParentId;
      let lastCreatedId: string | null = null;

      for (const segment of resolution.missingSegments) {
         const noteId = this.createSingleNote(currentParentId, {
            title: segment,
         });

         if (!noteId) {
            console.error(`Failed to create note: ${segment}`);
            break;
         }

         lastCreatedId = noteId;
         currentParentId = noteId;
      }

      return lastCreatedId;
   }

   // === CREACIÓN DE NOTAS ===

   private createSingleNote(
      parentId?: string,
      noteParts?: Partial<Note>,
   ): string | null {
      try {
         const newNote: Note = this.buildNoteObject(parentId, noteParts);

         noteModel.createNote(newNote);
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
         title: generateUniqueTitle(noteModel.getAllNotes(), noteParts?.title),
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

      noteModel.updateNote(parentId, (parent) => ({
         ...parent,
         children: [...parent.children, childId],
      }));
   }

   // === FUNCIONES AUXILIARES ===

   private validateParentExists(parentId: string): boolean {
      if (!noteQueryController.getNoteById(parentId)) {
         console.error(`Parent note with id ${parentId} not found`);
         return false;
      }
      return true;
   }

   private findNoteByTitleAndParent(
      title: string,
      parentId?: string,
   ): Note | null {
      const normalizedTitle = normalizeText(title);

      return (
         noteModel.getAllNotes().find((note) => {
            const matchesParent = (note.parentId || undefined) === parentId;
            const matchesTitle = normalizeText(note.title) === normalizedTitle;
            return matchesParent && matchesTitle;
         }) || null
      );
   }

   private openAndFocusNote(noteId: string): void {
      workspaceController.openNote(noteId);
      focusController.requestFocus(FocusTarget.TITLE);
   }

   // === FUNCIONES EXISTENTES (sin cambios) ===

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
      const activeNoteId = workspaceController.activeNoteId;
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspaceController.closeTabByTabId(activeNoteId);
      }

      notificationController.addNotification({
         message: `Nota "${noteToDelete.title}" eliminada.`,
         type: "base",
      });
   };
}

export const noteController = $state(new NoteController());
