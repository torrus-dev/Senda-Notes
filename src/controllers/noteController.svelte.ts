import { FocusTarget } from "../types/types";
import type { Note } from "../types/noteTypes";
import { DateTime } from "luxon";

import { focusController } from "./focusController.svelte";
import {
  createDefaultMetadata,
  generateUniqueTitle,
  getDescendants,
  sanitizeTitle,
  updateModifiedMetadata,
} from "../lib/utils/noteUtils";

import { loadNotesFromStorage, saveNotesToStorage } from "../lib/utils/storage";

class NoteController {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.notes = loadNotesFromStorage();
    this.setupAutoSave();
  }

  private setupAutoSave() {
    $effect.root(() => {
      $effect(() => {
        // Crear una copia para asegurar la reactividad
        const currentNotes = [...this.notes];

        // Limpiar cualquier timeout pendiente
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }

        // Establecer un nuevo timeout para guardar
        this.saveTimeout = setTimeout(() => {
          saveNotesToStorage(currentNotes);
          this.saveTimeout = null;
        }, 5000);

        // Cleanup del efecto
        return () => {
          if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
          }
        };
      });
    });
  }

  forceImmediateSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    saveNotesToStorage(this.notes);
  }

  // -------------------
  // Helpers de actualización
  // -------------------
  /**
   * Actualiza una nota de la lista `notes` según su identificador.
   *
   * @param id - Identificador único de la nota a actualizar.
   * @param updater - Función que recibe una nota y devuelve la nota actualizada.
   *
   * La función recorre la lista de notas y cuando encuentra la nota cuyo `id` coincide,
   * la pasa a la función `updater` para obtener la nota modificada. Además, se actualiza
   * automáticamente el timestamp de modificación (`modified`) usando la función `currentDate()`.
   */
  private updateNoteById = (
    id: string,
    updater: (note: Note) => Note,
  ): void => {
    // Recorremos todas las notas y devolvemos una nueva lista actualizada
    const index = this.notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notes[index] = updateModifiedMetadata(updater(this.notes[index]));
    }
  };

  // -------------------
  // Validaciones y utilidades
  // -------------------
  private requireNote = (id: string, context: string = "Note"): Note => {
    const note = this.getNoteById(id);
    if (!note) throw new Error(`${context} ${id} not found`);
    return note;
  };

  private wouldCreateCycle = (parentId: string, childId: string): boolean => {
    let current = this.getNoteById(parentId);
    while (current?.parentId) {
      if (current.parentId === childId) return true;
      current = this.getNoteById(current.parentId);
    }
    return false;
  };

  // -------------------
  // Gestión de relaciones
  // -------------------
  private removeFromParent = (childId: string): void => {
    this.notes = this.notes.map((note) => {
      if (note.children.includes(childId)) {
        return {
          ...note,
          children: note.children.filter((id) => id !== childId),
        };
      }
      return note;
    });
  };

  private addToParent = (
    parentId: string,
    childId: string,
    position?: number,
  ): void => {
    this.updateNoteById(parentId, (note) => {
      let newChildren = [...note.children];

      // Si la nota ya es hija, la eliminamos primero para evitar duplicados
      if (newChildren.includes(childId)) {
        newChildren = newChildren.filter((id) => id !== childId);
      }

      // Insertamos en la posición especificada o al final
      if (position !== undefined) {
        const targetPosition = Math.min(
          Math.max(0, position),
          newChildren.length,
        );
        newChildren.splice(targetPosition, 0, childId);
      } else {
        newChildren.push(childId);
      }

      return {
        ...note,
        children: newChildren,
      };
    });
  };

  // -------------------
  // Funciones principales
  // -------------------
  createNote = (parentId?: string | null, position?: number): void => {
    if (typeof parentId === "string") {
      this.requireNote(parentId, "Parent note");
    }

    const note: Note = {
      id: crypto.randomUUID(),
      title: generateUniqueTitle(this.notes),
      children: [],
      content: "",
      metadata: createDefaultMetadata(),
      properties: [],
      parentId: typeof parentId === "string" ? parentId : undefined,
    };

    this.notes = [...this.notes, note];

    if (typeof parentId === "string") {
      this.addToParent(parentId, note.id, position);
    }

    this.activeNoteId = note.id;
    focusController.requestFocus(FocusTarget.TITLE);

    this.forceImmediateSave();
  };

  updateNote = (id: string, updates: Partial<Note>): void => {
    const note = this.requireNote(id);

    // Campos que provocan guardado inmediato
    const STRUCTURAL_FIELDS: (keyof Note)[] = ["title", "icon", "properties"];

    // Filtrar solo los campos válidos para actualizar
    const validUpdates: Partial<Note> = {};

    // Verificación y asignación explícita de tipos
    if (updates.title && typeof updates.title === "string") {
      validUpdates.title = sanitizeTitle(updates.title);
    }

    if (updates.icon && typeof updates.icon === "string") {
      validUpdates.icon = updates.icon;
    }

    if (updates.content && typeof updates.content === "string") {
      validUpdates.content = updates.content;
    }

    if (updates.properties && Array.isArray(updates.properties)) {
      validUpdates.properties = updates.properties;
    }

    // Sin actualizaciones, salimos
    if (Object.keys(validUpdates).length === 0) return;

    // Actualizar la nota
    this.updateNoteById(id, (existingNote) => ({
      ...existingNote,
      ...validUpdates,
      // Aseguramos propiedades por defecto
      title: validUpdates.title ?? existingNote.title,
      properties: validUpdates.properties ?? existingNote.properties,
    }));

    // Guardado inmediato para cambios estructurales
    const hasStructuralChanges = STRUCTURAL_FIELDS.some(
      (field) => field in validUpdates,
    );
    if (hasStructuralChanges) {
      this.forceImmediateSave();
    }
  };

  deleteNote = (id: string): void => {
    this.requireNote(id);

    // crear un set con el id recibido y los id de los descendientes
    const idsToDelete = new Set([id, ...getDescendants(this.notes, id)]);

    // Eliminar nota y notas descendientes
    const remainingNotes = this.notes.filter(
      (note) => !idsToDelete.has(note.id),
    );

    // Luego actualizar referencias a hijos eliminados
    this.notes = remainingNotes.map((note) => {
      if (note.children.some((child) => idsToDelete.has(child))) {
        return updateModifiedMetadata({
          ...note,
          children: note.children.filter((child) => !idsToDelete.has(child)),
        });
      }
      return note;
    });

    // Quitar la nota activa si se ha eliminado
    if (this.activeNoteId && idsToDelete.has(this.activeNoteId)) {
      this.activeNoteId = null;
    }

    this.forceImmediateSave();
  };

  moveNoteToPosition = (
    noteId: string,
    newParentId: string | null,
    position: number,
  ): void => {
    const note = this.requireNote(noteId);

    // Mover reposicionando en el mismo padre
    if (newParentId === note.parentId) {
      if (newParentId === null) {
        // Reposicionar en notas raíz
        const rootNotes = this.getRootNotes();
        const rootIds = rootNotes.map((n) => n.id);
        const currentIndex = rootIds.indexOf(noteId);

        if (currentIndex !== -1) {
          // Reordenamos la lista de IDs
          rootIds.splice(currentIndex, 1);
          const targetPosition = Math.min(
            Math.max(0, position),
            rootIds.length,
          );
          rootIds.splice(targetPosition, 0, noteId);

          // Actualizamos las notas raíz, aplicando updateModified en cada una
          this.notes = [
            ...rootIds
              .map((id) => {
                const n = this.getNoteById(id);
                return n ? updateModifiedMetadata(n) : null;
              })
              .filter((n): n is Note => n !== null),
            ...this.notes.filter((n) => n.parentId !== undefined),
          ];
        }
      } else {
        // Reposicionar en las notas hijo
        // Revisar esta función por que parece que no funciona bien
        this.addToParent(newParentId, noteId, position);
      }
      return;
    }

    // Mover a raíz con posición
    if (newParentId === null) {
      if (note.parentId) {
        this.removeFromParent(noteId);
        this.updateNoteById(noteId, (note) => ({
          ...note,
          parentId: undefined,
        }));
      }

      const rootNotes = this.getRootNotes();
      const rootIds = rootNotes.map((n) => n.id);
      const targetPosition = Math.min(Math.max(0, position), rootIds.length);

      const currentIndex = rootIds.indexOf(noteId);
      if (currentIndex !== -1) {
        rootIds.splice(currentIndex, 1);
      }
      rootIds.splice(targetPosition, 0, noteId);

      // Al reordenar, si consideramos que afecta al estado, actualizamos cada nota
      this.notes = [
        ...rootIds
          .map((id) => {
            const n = this.getNoteById(id);
            return n ? updateModifiedMetadata(n) : null;
          })
          .filter((n): n is Note => n !== null),
        ...this.notes.filter((n) => n.parentId !== undefined),
      ];
      return;
    }

    // Mover a un nuevo padre con posición
    this.requireNote(newParentId, "New parent note");
    if (newParentId === noteId) throw new Error("Cannot move note to itself");
    if (this.wouldCreateCycle(newParentId, noteId)) {
      throw new Error("Cannot move note to its own descendant");
    }

    if (note.parentId) {
      this.removeFromParent(noteId);
    }

    // Actualiza la nota; updateNoteById se encargará de refrescar modified
    this.updateNoteById(noteId, (note) => ({ ...note, parentId: newParentId }));

    // Al añadir la nota al nuevo padre, addToParent también actualiza modified
    this.addToParent(newParentId, noteId, position);

    this.forceImmediateSave();
  };

  // -------------------
  // Getters y setters
  // -------------------
  getNoteById = (id: string): Note | undefined =>
    this.notes.find((note) => note.id === id);

  getActiveNote = (): Note | null => {
    if (!this.activeNoteId) return null;
    const note = this.getNoteById(this.activeNoteId);
    if (!note) {
      console.warn("Active note was removed, cleaning reference");
      this.activeNoteId = null;
      return null;
    }
    return note;
  };

  getRootNotes = (): Note[] => this.notes.filter((note) => !note.parentId);

  setActiveNote = (id: string): void => {
    this.requireNote(id);
    this.activeNoteId = id;
  };

  getBreadcrumbPath(noteId: string): Array<{ id: string; title: string }> {
    const path = [];
    let currentNote = this.getNoteById(noteId);

    while (currentNote) {
      path.unshift({
        // Usamos unshift para mantener el orden padre -> abuelo -> etc.
        id: currentNote.id,
        title: currentNote.title,
      });

      currentNote = currentNote.parentId
        ? this.getNoteById(currentNote.parentId)
        : undefined;
    }

    return path;
  }

  // Obtiene el número total de notas en el sistema
  getNoteCount = (): number => {
    return this.notes.length;
  };

  // Obtiene el número total de notas hijas directas e indirectas (descendientes)
  // de una nota específica
  getChildrenCount = (noteId: string): number => {
    const note = this.getNoteById(noteId);
    if (!note) return 0;

    // Obtenemos todos los descendientes y contamos
    const descendants = getDescendants(this.notes, noteId);
    return descendants.length;
  };
}

export let noteController = $state(new NoteController());
