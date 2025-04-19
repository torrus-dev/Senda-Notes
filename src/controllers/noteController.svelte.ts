import { FocusTarget } from "@projectTypes/focusTypes";
import type { Note } from "@projectTypes/noteTypes";

import { noteStore } from "@stores/noteStore.svelte";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";

import { focusController } from "@controllers/focusController.svelte";
import { noteTreeController } from "@controllers//noteTreeController.svelte";
import { noteQueryController } from "@controllers//noteQueryController.svelte";
import { workspace } from "@controllers/workspaceController.svelte";

class NoteController {
   isDataSaved = $derived(noteStore.isDataSaved);

   createNote = (parentId?: string | undefined, position?: number): void => {
      // Guardar cualquier contenido pendiente antes de crear una nueva nota
      noteStore.forceSave();

      if (typeof parentId === "string") {
         noteQueryController.requireNote(parentId, "Parent note");
      }

      const note: Note = {
         id: crypto.randomUUID(),
         title: generateUniqueTitle(noteStore.getNotes()),
         children: [],
         content: "",
         metadata: createDefaultMetadata(),
         properties: [],
         parentId: typeof parentId === "string" ? parentId : undefined,
      };

      noteStore.addNote(note);

      if (typeof parentId === "string") {
         // Actualizamos el array de notas para agregar el ID de la nueva nota al padre
         noteStore.updateNotes((notes) =>
            notes.map((n) =>
               n.id === parentId
                  ? { ...n, children: [...n.children, note.id] }
                  : n,
            ),
         );
      }

      workspace.setActiveNoteId(note.id);
      focusController.requestFocus(FocusTarget.TITLE);
   };

   updateNote = (noteId: string, updates: Partial<Note>): void => {
      noteQueryController.requireNote(noteId);

      // Si solo hay una actualización de contenido y la nota es la activa,
      // delegamos al método con delay
      if (
         Object.keys(updates).length === 1 &&
         "content" in updates &&
         typeof updates.content === "string" &&
         noteId === workspace.getActiveNoteId()
      ) {
         noteStore.updateNoteContentWithDelay(
            noteId,
            updates.content,
            noteId === workspace.getActiveNoteId(),
         );
         return;
      }

      // Validación para tipos estrictos
      const validUpdates = Object.fromEntries(
         Object.entries(updates)
            .filter(([key, value]) => {
               if (key === "title") return typeof value === "string";
               if (["icon", "content"].includes(key))
                  return typeof value === "string";
               if (key === "properties") return Array.isArray(value);
               return false;
            })
            .map(([key, value]) => [
               key,
               key === "title" ? sanitizeTitle(value as string) : value,
            ]),
      );

      if (Object.keys(validUpdates).length === 0) return;

      // Actualizar la nota inmediatamente
      noteStore.updateNoteById(noteId, (existing) => ({
         ...existing,
         ...validUpdates,
      }));
   };

   updateNoteContent = (noteId: string, content: string): void => {
      noteQueryController.requireNote(noteId);

      // Determinar si es la nota activa
      const isActiveNote = noteId === workspace.getActiveNoteId();

      // Delegar al store
      noteStore.updateNoteContentWithDelay(noteId, content, isActiveNote);
   };

   deleteNote = (id: string): void => {
      // Guardar cualquier contenido pendiente antes de eliminar notas
      noteStore.forceSave();

      // Nos aseguramos de que la nota existe.
      noteQueryController.requireNote(id);

      // Recopilamos recursivamente los IDs de la nota y todos sus descendientes usando parentId.
      const idsToDelete = noteTreeController.getDescendantIds(id);
      idsToDelete.add(id);

      // Eliminar cualquier actualización pendiente para estas notas
      noteStore.clearPendingUpdates(idsToDelete);

      // Filtramos las notas eliminando las que están en idsToDelete.
      noteStore.updateNotes((notes) =>
         notes.filter((note) => !idsToDelete.has(note.id)),
      );

      // Actualizamos el array children de las notas restantes (por si algún padre referenciaba notas eliminadas)
      noteStore.updateNotes((notes) =>
         notes.map((n) =>
            n.children.some((childId) => idsToDelete.has(childId))
               ? updateModifiedMetadata({
                    ...n,
                    children: n.children.filter(
                       (childId) => !idsToDelete.has(childId),
                    ),
                 })
               : n,
         ),
      );

      // Si la nota activa fue borrada, se limpia la referencia.
      const activeNoteId = workspace.getActiveNoteId();
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspace.unsetActiveNoteId();
      }
   };
}

export let noteController = $state(new NoteController());
