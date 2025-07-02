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

class NoteController {
   setAllNotes = noteModel.setAllNotes.bind(noteModel);

   // hay que mejorar y ampliar esta función mucho.
   // habria que dividirla en funciones interna de utilidad. Si el titulo que le pasamos en el Partial contiene "/" habria que tenerlo en cuenta a la hora de crearla, si la ruta ya existe, añadirlo en ella y si no existe crear todas las notas para que se cree la ruta y finalmente añadir esta nota nueva, por lo que deberia soportar algo de recursividad
   // luego de cara a las templates que aplicaremos de forma jerarquica es decir podemos definir una template para aplicar a las subnotas dentro de la nota, entonces habria que tener esto en cuenta a la hora de crear, tambien si se crea por que falta la ruta, tambien hay que tener en cuenta las templates que se apliquen que seran distintas.

   // Cuando queremos crear "nota3" dentro de "nota2" y tenermos la ruta "nota1/nota2/nota3", igual seria mejor no pasarle la ruta completa a esta función (pensaba pasarle la ruta entera en el title) y tener una función previa que ya lo procese y desmenuce y llame a este con (parentId = nota2.id, noteParts {title: "nota3"})
   createNote = (parentId?: string, noteParts?: Partial<Note>): void => {
      // Validación previa si hay padre
      if (parentId && !noteQueryController.getNoteById(parentId)) {
         console.error(`Parent note with id ${parentId} not found`);
         return;
      }

      // crear función para extraer el parentId a partir de valor de busqueda, sera el ultimo valor antes del / en la jerarquia.

      // Generar campos por defecto y sobrescribir con noteParts si existen
      const newNote: Note = {
         id: noteParts?.id ?? crypto.randomUUID(),
         title: noteParts?.title ?? generateUniqueTitle(noteModel.getAllNotes()),
         children: noteParts?.children ?? [],
         content: noteParts?.content ?? "",
         metadata: noteParts?.metadata ?? createDefaultMetadata(),
         properties: noteParts?.properties ?? [],
         parentId: parentId ?? noteParts?.parentId,
         icon: noteParts?.icon,
         stats: noteParts?.stats,
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

      workspaceController.openNote(newNote.id);
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
