import type { Note, Property } from "../types/types";

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

  // Función de carga de datos con protección ante errores en el parseo de JSON
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

  // Función de guardado de datos con protección ante posibles errores al escribir en localStorage
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

  // Marca la nota como modificada actualizando la metadata "modified"
  private markModified = (note: Note): Note => {
    const updatedMetadata = note.metadata.map((prop) =>
      prop.name === "modified" ? { ...prop, value: this.currentDate() } : prop,
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

  private validateParentChild = (parentId: string, childId: string): void => {
    this.requireNote(parentId, "Parent note");
    this.requireNote(childId, "Child note");
    if (this.wouldCreateCycle(parentId, childId)) {
      throw new Error("This operation would create a circular reference");
    }
  };

  private validateNoteOrder(
    newOrder: string[],
    expectedIds: string[],
    contextCheck?: (id: string) => boolean,
  ): boolean {
    const validations = {
      sameLength: newOrder.length === expectedIds.length,
      allIdsValid: newOrder.every((id) => expectedIds.includes(id)),
      allUnique: new Set(newOrder).size === newOrder.length,
      contextValid: contextCheck ? newOrder.every(contextCheck) : true,
    };

    return Object.values(validations).every(Boolean);
  }

  private validateRootOrder = (newOrder: string[]): boolean => {
    const rootIds = this.getRootNotes().map((n) => n.id);
    return this.validateNoteOrder(newOrder, rootIds);
  };

  private validateSiblingOrder = (
    parent: Note,
    newOrder: string[],
  ): boolean => {
    return this.validateNoteOrder(
      newOrder,
      parent.children,
      (id) => this.getNoteById(id)?.parentId === parent.id,
    );
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

  private addChild = (parentId: string, childId: string): void => {
    // Validar existencia y evitar ciclos
    this.validateParentChild(parentId, childId);
    const childNote = this.getNoteById(childId);
    if (childNote && childNote.parentId && childNote.parentId !== parentId) {
      // Si el child tenía otro padre, lo removemos de su padre anterior
      this.removeFromParent(childId);
    }
    this.updateNoteById(parentId, (note) => {
      if (!note.children.includes(childId)) {
        return this.markModified({
          ...note,
          children: [...note.children, childId],
        });
      }
      return note;
    });
    this.updateNoteById(childId, (note) => ({ ...note, parentId }));
  };

  private handleParentChange = (
    noteId: string,
    newParentId: string | null,
  ): void => {
    const note = this.requireNote(noteId);
    if (newParentId === note.parentId) return;
    if (newParentId) {
      this.addChild(newParentId, noteId);
    } else if (note.parentId) {
      this.removeFromParent(noteId);
      this.updateNoteById(noteId, (n) =>
        this.markModified({ ...n, parentId: undefined }),
      );
    }
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
      value: this.currentDate(),
      type: "datetime",
    },
    {
      id: crypto.randomUUID(),
      name: "modified",
      value: this.currentDate(),
      type: "datetime",
    },
  ];

  currentDate = (): string => new Date().toISOString();

  sanitizeTitle = (title: string): string =>
    title
      .replace(/[\n\r]+/g, " ")
      .trim()
      .slice(0, 100);

  private getDescendants = (parentId: string): string[] => {
    const parent = this.getNoteById(parentId);
    if (!parent) return [];
    return parent.children.reduce((acc: string[], childId) => {
      return [...acc, childId, ...this.getDescendants(childId)];
    }, []);
  };

  // -------------------
  // Funciones principales
  // -------------------
  createNote = (parentId?: string | null): void => {
    if (typeof parentId === "string") {
      console.log("probando");
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
      this.addChild(parentId, note.id);
    }

    this.activeNoteId = note.id;
  };

  updateNote = (id: string, updates: Partial<Note>): void => {
    this.requireNote(id);
    if ("parentId" in updates) {
      this.handleParentChange(id, updates.parentId ?? null);
    }
    this.updateNoteById(id, (note) => {
      const merged = {
        ...note,
        ...updates,
        title: this.sanitizeTitle(updates.title ?? note.title),
        properties: updates.properties ?? note.properties,
      };
      return this.markModified(merged);
    });
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
        this.updateNote(noteId, { parentId: undefined });
      }
      return;
    }

    // Validar movimiento a otro padre
    this.requireNote(newParentId, "New parent note");
    if (newParentId === noteId) throw new Error("Cannot move note to itself");
    if (this.wouldCreateCycle(newParentId, noteId)) {
      throw new Error("Cannot move note to its own descendant");
    }
    this.handleParentChange(noteId, newParentId);
  };

  reorderNotes = (parentId: string | null, newOrder: string[]): void => {
    // Caso para notas raíz
    if (parentId === null) {
      const currentRootIds = this.getRootNotes().map((n) => n.id);

      // Validar que el nuevo orden contiene exactamente las mismas notas raíz
      if (!this.validateRootOrder(newOrder)) {
        throw new Error("Invalid root notes order");
      }

      // Reordenar manteniendo la referencia completa de las notas
      this.notes = [
        ...newOrder.map((id) => this.requireNote(id)),
        ...this.notes.filter((n) => n.parentId !== undefined),
      ];
      return;
    }

    // Caso para notas con padre
    const parent = this.requireNote(parentId, "Parent note");
    if (!this.validateSiblingOrder(parent, newOrder)) {
      throw new Error("Invalid children order");
    }
    this.updateNoteById(parentId, (note) =>
      this.markModified({ ...note, children: newOrder }),
    );
  };

  createProperty = (noteId: string, property: Omit<Property, "id">) => {
    if (!this.getNoteById(noteId)) {
      throw new Error(`Note ${noteId} not found`);
    }

    this.notes = this.notes.map((note) => {
      if (note.id === noteId) {
        const newProperty: Property = {
          ...property,
          id: crypto.randomUUID(),
          value: property.value ?? this.getDefaultTypeValue(property.type),
        };
        return {
          ...note,
          properties: [...note.properties, newProperty],
          metadata: note.metadata.map((prop) =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop,
          ),
        };
      }
      return note;
    });
  };

  updateProperty = (
    noteId: string,
    propertyId: string,
    updates: Partial<Omit<Property, "id">>,
  ) => {
    if (!this.getNoteById(noteId)) {
      throw new Error(`Note ${noteId} not found`);
    }

    this.notes = this.notes.map((note) => {
      if (note.id === noteId) {
        const updatedProperties = note.properties.map((property) => {
          if (property.id === propertyId) {
            const newType = updates.type ?? property.type;
            return {
              ...property,
              ...updates,
              value:
                updates.type !== undefined
                  ? this.getDefaultTypeValue(newType)
                  : (updates.value ?? property.value),
              type: newType,
            };
          }
          return property;
        });
        return {
          ...note,
          properties: updatedProperties,
          metadata: note.metadata.map((prop) =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop,
          ),
        };
      }
      return note;
    });
  };

  deleteProperty = (noteId: string, propertyId: string) => {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error(`Note ${noteId} not found`);

    if (!note.properties.some((p) => p.id === propertyId)) {
      throw new Error(`Property ${propertyId} not found in note ${noteId}`);
    }

    this.notes = this.notes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          properties: note.properties.filter((p) => p.id !== propertyId),
          metadata: note.metadata.map((prop) =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop,
          ),
        };
      }
      return note;
    });
  };

  getDefaultTypeValue(type: Property["type"]) {
    switch (type) {
      case "text":
        return "";
      case "list":
        return [];
      case "number":
        return 0;
      case "check":
        return false;
      case "date":
        return new Date().toISOString().split("T")[0];
      case "datetime":
        return new Date().toISOString();
      default:
        return ""; // Valor seguro por defecto
    }
  }

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

  setActiveNote = (id: string): void => {
    this.requireNote(id);
    this.activeNoteId = id;
  };
}

export const noteController = $state(new NoteController());
