import type { Note, Property } from "../types/types";
import { currentDate } from "./utils.svelte";

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
        this.notes = JSON.parse(stored);
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
      localStorage.setItem("NoteList", JSON.stringify(this.notes));
    } catch (error) {
      console.error("Error al guardar NoteList en localStorage:", error);
    }
  }

  // -------------------
  // Helpers de actualización
  // -------------------
  private updateNoteById = (
    id: string,
    updater: (note: Note) => Note,
  ): void => {
    this.notes = this.notes.map((note) =>
      note.id === id ? updater(note) : note,
    );
  };

  private markModified = (note: Note): Note => {
    const updatedMetadata = note.metadata.map((prop) =>
      prop.name === "modified" ? { ...prop, value: currentDate() } : prop,
    );
    return { ...note, metadata: updatedMetadata };
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
        return this.markModified({
          ...note,
          children: note.children.filter((id) => id !== childId),
        });
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

      return this.markModified({
        ...note,
        children: newChildren,
      });
    });
  };

  // -------------------
  // Funciones auxiliares
  // -------------------

  private generateUniqueTitle = (): string => {
    const base = "Nota Nueva";
    const titles = new Set(this.notes.map((n) => n.title));
    if (!titles.has(base)) return base;
    let index = 1;
    while (titles.has(`${base} ${index}`)) index++;
    return `${base} ${index}`;
  };

  private createDefaultMetadata = (): Property[] => [
    {
      id: crypto.randomUUID(),
      name: "created",
      value: currentDate(),
      type: "datetime",
    },
    {
      id: crypto.randomUUID(),
      name: "modified",
      value: currentDate(),
      type: "datetime",
    },
  ];

  private getDescendants = (parentId: string): string[] => {
    const parent = this.getNoteById(parentId);
    if (!parent) return [];
    return parent.children.reduce((acc: string[], childId) => {
      return [...acc, childId, ...this.getDescendants(childId)];
    }, []);
  };

  sanitizeTitle = (title: string): string =>
    title
      .replace(/[\n\r]+/g, " ")
      .trim()
      .slice(0, 100);

  isDescendant(descendantId: string, ancestorId: string): boolean {
    let currentNote = this.getNoteById(descendantId);
    while (currentNote) {
      if (currentNote.parentId === ancestorId) return true;
      if (!currentNote.parentId) break;
      currentNote = this.getNoteById(currentNote.parentId);
    }
    return false;
  }

  // -------------------
  // Funciones principales
  // -------------------
  createNote = (parentId?: string | null, position?: number): void => {
    if (typeof parentId === "string") {
      this.requireNote(parentId, "Parent note");
    }

    const note: Note = {
      id: crypto.randomUUID(),
      title: this.generateUniqueTitle(),
      children: [],
      content: "",
      metadata: this.createDefaultMetadata(),
      properties: [],
      parentId: typeof parentId === "string" ? parentId : undefined,
    };

    this.notes = [...this.notes, note];

    if (typeof parentId === "string") {
      this.addToParent(parentId, note.id, position);
    }

    this.activeNoteId = note.id;
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
          this.updateNoteById(id, (note) =>
            this.markModified({ ...note, parentId: undefined }),
          );
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
          title: updates.title ? this.sanitizeTitle(updates.title) : note.title,
          properties: updates.properties ?? note.properties,
        };
        return this.markModified(merged);
      });
    }
  };

  deleteNote = (id: string): void => {
    this.requireNote(id);
    const idsToDelete = new Set([id, ...this.getDescendants(id)]);
    this.notes = this.notes
      .filter((note) => !idsToDelete.has(note.id))
      .map((note) =>
        note.children.some((child) => idsToDelete.has(child))
          ? this.markModified({
              ...note,
              children: note.children.filter(
                (child) => !idsToDelete.has(child),
              ),
            })
          : note,
      );
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
        this.updateNoteById(noteId, (note) =>
          this.markModified({ ...note, parentId: undefined }),
        );
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
    this.updateNoteById(noteId, (note) =>
      this.markModified({ ...note, parentId: newParentId }),
    );

    // Añadir al nuevo padre
    this.addToParent(newParentId, noteId);
  };

  moveNoteToPosition = (
    noteId: string,
    newParentId: string | null,
    position: number,
  ): void => {
    const note = this.requireNote(noteId);

    // Manejar reposicionamiento en el mismo padre
    if (newParentId === note.parentId) {
      if (newParentId === null) {
        // Reposicionar en notas raíz
        const rootNotes = this.getRootNotes();
        const rootIds = rootNotes.map((n) => n.id);
        const currentIndex = rootIds.indexOf(noteId);

        if (currentIndex !== -1) {
          // Remover y reposicionar en el array
          rootIds.splice(currentIndex, 1);
          const targetPosition = Math.min(
            Math.max(0, position),
            rootIds.length,
          );
          rootIds.splice(targetPosition, 0, noteId);

          // Reorganizar las notas raíz según el nuevo orden
          this.notes = [
            ...(rootIds
              .map((id) => this.getNoteById(id))
              .filter(Boolean) as Note[]),
            ...this.notes.filter((n) => n.parentId !== undefined),
          ];
        }
      } else {
        // Reposicionar en las notas hijo
        this.addToParent(newParentId, noteId, position);
      }
      return;
    }

    // Si es un cambio de padre con posición específica

    // Mover a raíz con posición
    if (newParentId === null) {
      // Primero lo movemos a raíz
      if (note.parentId) {
        this.removeFromParent(noteId);
        this.updateNoteById(noteId, (note) =>
          this.markModified({ ...note, parentId: undefined }),
        );
      }

      // Luego lo posicionamos entre las notas raíz
      const rootNotes = this.getRootNotes();
      const rootIds = rootNotes.map((n) => n.id);
      const targetPosition = Math.min(Math.max(0, position), rootIds.length);

      // Remover si ya existe
      const currentIndex = rootIds.indexOf(noteId);
      if (currentIndex !== -1) {
        rootIds.splice(currentIndex, 1);
      }

      // Insertar en la nueva posición
      rootIds.splice(targetPosition, 0, noteId);

      // Reorganizar las notas raíz
      this.notes = [
        ...(rootIds
          .map((id) => this.getNoteById(id))
          .filter(Boolean) as Note[]),
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

    // Remover de su padre actual si tiene
    if (note.parentId) {
      this.removeFromParent(noteId);
    }

    // Actualizar la nota
    this.updateNoteById(noteId, (note) =>
      this.markModified({ ...note, parentId: newParentId }),
    );

    // Añadir al nuevo padre en la posición especificada
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
    const descendants = this.getDescendants(noteId);
    return descendants.length;
  };
}

export let noteController = $state(new NoteController());
