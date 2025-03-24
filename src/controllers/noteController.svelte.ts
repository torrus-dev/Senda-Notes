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

class NoteController {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);

  constructor() {
    this.loadFromLocalStorage();
    this.setupAutoSave();
  }

  // -------------------
  // Persistencia y Auto-save
  // -------------------
  private setupAutoSave() {
    $effect.root(() => {
      $effect(() => {
        this.saveToLocalStorage();
      });
    });
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem("NoteList");
    if (stored) {
      try {
        const parsedNotes = JSON.parse(stored);
        // Convertir los campos `created` y `modified` a instancias de DateTime
        this.notes = parsedNotes.map((note: any) => ({
          ...note,
          metadata: {
            ...note.metadata,
            created: DateTime.fromISO(note.metadata.created),
            modified: DateTime.fromISO(note.metadata.modified),
          },
        }));
      } catch (error) {
        console.error("Error al parsear NoteList desde localStorage:", error);
        this.notes = [];
      }
    } else {
      this.notes = [];
    }
  }

  private saveToLocalStorage() {
    try {
      // Convertir los campos `created` y `modified` a cadenas ISO antes de guardar
      const serializedNotes = this.notes.map((note) => ({
        ...note,
        metadata: {
          ...note.metadata,
          created: note.metadata.created.toISO(),
          modified: note.metadata.modified.toISO(),
        },
      }));
      localStorage.setItem("NoteList", JSON.stringify(serializedNotes));
    } catch (error) {
      console.error("Error al guardar NoteList en localStorage:", error);
    }
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
    this.notes = this.notes.map((note) => {
      // Comprobamos si el id de la nota coincide con el id buscado

      // Si no coincide el id, retornamos la nota sin cambios
      if (note.id !== id) return note;

      // Aplicamos la función de actualización a la nota encontrada
      const updatedNote = updater(note);
      // Actualizamos el timestamp de modificación automáticamente y retornamos la nota actualizada
      return updateModifiedMetadata(updatedNote);
    });
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
  };

  updateNote = (id: string, updates: Partial<Note>): void => {
    this.requireNote(id);
    if ("parentId" in updates) {
      // Manejar cambio de padre
      const newParentId = updates.parentId ?? null;

      // Verificar si realmente cambia el padre
      const currentNote = this.getNoteById(id);
      if (currentNote && currentNote.parentId !== newParentId) {
        if (newParentId) {
          // Validar el nuevo padre
          this.requireNote(newParentId, "Parent note");
          if (id === newParentId)
            throw new Error("Cannot set parent to itself");
          if (this.wouldCreateCycle(newParentId, id)) {
            throw new Error("This operation would create a circular reference");
          }

          // Primero removemos de su padre actual si tiene
          if (currentNote.parentId) {
            this.removeFromParent(id);
          }

          // Actualizamos la referencia al padre en la nota
          this.updateNoteById(id, (note) => ({
            ...note,
            parentId: newParentId,
          }));

          // Añadimos la nota al nuevo padre
          this.addToParent(newParentId, id);
        } else if (currentNote.parentId) {
          // Remover de su padre actual y convertir en nota raíz
          this.removeFromParent(id);
          this.updateNoteById(id, (note) => ({ ...note, parentId: undefined }));
        }
      }

      // Eliminamos parentId de updates para evitar procesarlo dos veces
      const { parentId, ...restUpdates } = updates;
      updates = restUpdates;
    }

    // Aplicar el resto de actualizaciones
    if (Object.keys(updates).length > 0) {
      this.updateNoteById(id, (note) => {
        const merged = {
          ...note,
          ...updates,
          title: updates.title ? sanitizeTitle(updates.title) : note.title,
          properties: updates.properties ?? note.properties,
        };
        return merged;
      });
    }
  };

  deleteNote = (id: string): void => {
    this.requireNote(id);
    const idsToDelete = new Set([id, ...getDescendants(this.notes, id)]);
    this.notes = this.notes
      .filter((note) => !idsToDelete.has(note.id))
      .map((note) => {
        if (note.children.some((child) => idsToDelete.has(child))) {
          // Se actualiza la lista de children y se refresca el timestamp
          const updatedNote = {
            ...note,
            children: note.children.filter((child) => !idsToDelete.has(child)),
          };
          return updateModifiedMetadata(updatedNote);
        }
        return note;
      });
    if (this.activeNoteId && idsToDelete.has(this.activeNoteId)) {
      this.activeNoteId = null;
    }
  };

  moveNote = (noteId: string, newParentId: string | null): void => {
    const note = this.requireNote(noteId);

    // Si el nuevo padre es el mismo que el actual, no hacer nada
    if (newParentId === note.parentId) return;

    // Validar movimiento a raíz
    if (newParentId === null) {
      if (note.parentId) {
        this.removeFromParent(noteId);
        this.updateNoteById(noteId, (note) => ({
          ...note,
          parentId: undefined,
        }));
      }
      return;
    }

    // Validar movimiento a otro padre
    this.requireNote(newParentId, "New parent note");
    if (newParentId === noteId) throw new Error("Cannot move note to itself");
    if (this.wouldCreateCycle(newParentId, noteId)) {
      throw new Error("Cannot move note to its own descendant");
    }

    // Remover de su padre actual si tiene
    if (note.parentId) {
      this.removeFromParent(noteId);
    }

    // Actualizar la nota
    this.updateNoteById(noteId, (note) => ({ ...note, parentId: newParentId }));

    // Añadir al nuevo padre
    this.addToParent(newParentId, noteId);
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
