import type { Note, Property } from "./types/types";

class NoteController {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);

  constructor() {
    this.loadFromLocalStorage();
    this.setupAutoSave();
  }

  private setupAutoSave() {
    $effect.root(() => {
      $effect(() => {
        this.saveToLocalStorage();
      });
    });
  }

  private loadFromLocalStorage() {
    const noteList = localStorage.getItem("NoteList");
    this.notes = noteList ? JSON.parse(noteList) : [];
  }

  private saveToLocalStorage() {
    localStorage.setItem("NoteList", JSON.stringify(this.notes));
  }

  // Funciones auxiliares de validación
  private validateNoteExists = (noteId: string, context: string = 'Note') => {
    const note = this.getNoteById(noteId);
    if (!note) {
      throw new Error(`${context} ${noteId} not found`);
    }
    return note;
  };

  private validateParentChildOperation = (parentId: string, childId: string) => {
    const parentNote = this.validateNoteExists(parentId, 'Parent note');
    const childNote = this.validateNoteExists(childId, 'Child note');

    if (this.wouldCreateCycle(parentId, childId)) {
      throw new Error('This operation would create a circular reference');
    }

    return { parentNote, childNote };
  };

  // Función auxiliar para detectar ciclos
  private wouldCreateCycle = (parentId: string, childId: string): boolean => {
    let currentNote = this.getNoteById(parentId);
    while (currentNote?.parentId) {
      if (currentNote.parentId === childId) {
        return true;
      }
      currentNote = this.getNoteById(currentNote.parentId);
    }
    return false;
  };

  // Función para actualizar la metadata modified
  private updateModifiedMetadata = (note: Note): Note => {
    const updatedMetadata = note.metadata.map(prop =>
      prop.name === "modified"
        ? { ...prop, value: this.currentDate() }
        : prop
    );
    return { ...note, metadata: updatedMetadata };
  };

  // Función para remover un hijo de su padre actual
  private removeFromCurrentParent = (childId: string) => {
    this.notes = this.notes.map(note => {
      if (note.children.includes(childId)) {
        return {
          ...note,
          children: note.children.filter(id => id !== childId)
        };
      }
      return note;
    });
  };

  // Funciones principales actualizadas
  createNote = (parentId?: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: this.generateUniqueTitle(),
      children: [],
      content: "",
      metadata: this.createDefaultMetadata(),
      properties: [],
      parentId: parentId
    };

    if (parentId) {
      this.validateNoteExists(parentId, 'Parent note');
    }

    this.notes = [...this.notes, newNote];

    if (parentId) {
      this.addChildToParent(parentId, newNote.id);
    }

    this.activeNoteId = newNote.id;
  };

  private addChildToParent = (parentId: string, childId: string) => {
    const { parentNote, childNote } = this.validateParentChildOperation(parentId, childId);

    // Si la nota ya tiene un padre diferente, removerla
    if (childNote.parentId && childNote.parentId !== parentId) {
      this.removeFromCurrentParent(childId);
    }

    // Actualizar el padre y el hijo
    this.notes = this.notes.map(note => {
      if (note.id === parentId && !note.children.includes(childId)) {
        return {
          ...this.updateModifiedMetadata(note),
          children: [...note.children, childId]
        };
      }
      if (note.id === childId) {
        return {
          ...note,
          parentId: parentId
        };
      }
      return note;
    });
  };

  private generateUniqueTitle = () => {
    const baseTitle = "Nota Nueva";
    const existingTitles = new Set(this.notes.map(n => n.title));

    if (!existingTitles.has(baseTitle)) return baseTitle;

    let index = 1;
    while (existingTitles.has(`${baseTitle} ${index}`)) index++;
    return `${baseTitle} ${index}`;
  };

  private createDefaultMetadata = (): Property[] => [
    {
      id: crypto.randomUUID(),
      name: "created",
      value: this.currentDate(),
      type: "datetime"
    },
    {
      id: crypto.randomUUID(),
      name: "modified",
      value: this.currentDate(),
      type: "datetime"
    }
  ];

  currentDate = (): string => new Date().toISOString();

  updateNote = (id: string, updates: Partial<Note>) => {
    const existingNote = this.getNoteById(id);
    if (!existingNote) {
      throw new Error(`Note ${id} not found`);
    }

    // Gestionamos cambios en parentId
    if ('parentId' in updates) {
      const newParentId = updates.parentId;
      if (newParentId !== existingNote.parentId) {
        // Si se asigna un nuevo padre, validar y actualizar la relación
        if (newParentId) {
          this.addChildToParent(newParentId, id);
        } else {
          // Si se elimina el padre, remover la nota de los hijos del padre actual
          if (existingNote.parentId) {
            this.removeFromCurrentParent(id);
          }
        }
      }
    }

    // Actualizamos la nota
    this.notes = this.notes.map(note => {
      if (note.id === id) {
        const updatedMetadata = note.metadata.map(property =>
          property.name === "modified"
            ? { ...property, value: this.currentDate() }
            : property
        );

        return {
          ...note,
          ...updates,
          metadata: updatedMetadata,
          title: this.sanitizeTitle(updates.title ?? note.title),
          properties: updates.properties ?? note.properties,
        };
      }
      return note;
    });
  };


  deleteNote = (id: string) => {
    const noteToDelete = this.getNoteById(id);
    if (!noteToDelete) return;

    // Usar Set para mejor performance
    const idsToDelete = new Set([id, ...this.getDescendantIds(id)]);

    // Eliminación optimizada
    this.notes = this.notes
      .filter(note => !idsToDelete.has(note.id))
      .map(note => {
        // Detectar cambios eficientemente
        const hasDeletedChildren = note.children.some(childId => idsToDelete.has(childId));

        if (!hasDeletedChildren) return note;

        return {
          ...note,
          children: note.children.filter(childId => !idsToDelete.has(childId)),
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
        };
      });

    // Limpiar activeNoteId usando el Set
    if (this.activeNoteId && idsToDelete.has(this.activeNoteId)) {
      this.activeNoteId = null;
    }
  };

  private getDescendantIds = (parentId: string): string[] => {
    const parent = this.getNoteById(parentId);
    if (!parent) return [];

    return parent.children.reduce((acc: string[], childId) => {
      return [...acc, childId, ...this.getDescendantIds(childId)];
    }, []);
  };

  moveNote = (noteId: string, newParentId: string | null) => {
    const noteToMove = this.getNoteById(noteId);
    if (!noteToMove) throw new Error(`Note ${noteId} not found`);

    // Validar nuevo padre si existe
    if (newParentId && !this.getNoteById(newParentId)) {
      throw new Error(`New parent note ${newParentId} not found`);
    }

    if (newParentId === noteId) {
      throw new Error("Cannot move note to itself");
    }

    // Prevenir ciclos (nuevo padre no puede ser descendiente)
    if (newParentId && this.checkForCycle(noteId, newParentId)) {
      throw new Error("Cannot move note to its own descendant");
    }

    // Agregar al nuevo padre y actualizar metadata
    if (newParentId) {
      this.addChildToParent(newParentId, noteId);
    }

    // Actualizar todos los padres actuales y sus metadata
    this.notes = this.notes.map(note => {
      if (note.id !== newParentId && note.children.includes(noteId)) {
        const newChildren = note.children.filter(id => id !== noteId);
        return {
          ...note,
          children: newChildren,
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
        };
      }
      return note;
    });



    // Actualizar metadata de la nota movida
    this.updateNote(noteId, {});
  };

  private checkForCycle = (sourceId: string, targetId: string): boolean => {
    const targetDescendants = this.getDescendantIds(targetId);
    return targetDescendants.includes(sourceId);
  };

  reorderChildren = (parentId: string, newChildrenOrder: string[]) => {
    const parent = this.getNoteById(parentId);
    if (!parent) throw new Error(`Parent note ${parentId} not found`);

    // Validar que todos los hijos existen y son únicos
    const validOrder =
      newChildrenOrder.length === parent.children.length &&
      newChildrenOrder.every(id => parent.children.includes(id)) &&
      newChildrenOrder.every((id, index) => newChildrenOrder.indexOf(id) === index);

    if (!validOrder) throw new Error("Invalid children order");

    this.notes = this.notes.map(note => {
      if (note.id === parentId) {
        return {
          ...note,
          children: newChildrenOrder,
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
        };
      }
      return note;
    });
  };

  createProperty = (noteId: string, property: Omit<Property, "id">) => {
    if (!this.getNoteById(noteId)) {
      throw new Error(`Note ${noteId} not found`);
    }

    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        const newProperty: Property = {
          ...property,
          id: crypto.randomUUID(),
          value: property.value ?? this.getDefaultTypeValue(property.type)
        };
        return {
          ...note,
          properties: [...note.properties, newProperty],
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
        };
      }
      return note;
    });
  };

  updateProperty = (
    noteId: string,
    propertyId: string,
    updates: Partial<Omit<Property, "id">>
  ) => {
    if (!this.getNoteById(noteId)) {
      throw new Error(`Note ${noteId} not found`);
    }

    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        const updatedProperties = note.properties.map(property => {
          if (property.id === propertyId) {
            const newType = updates.type ?? property.type;
            return {
              ...property,
              ...updates,
              value: updates.type !== undefined
                ? this.getDefaultTypeValue(newType)
                : updates.value ?? property.value,
              type: newType
            };
          }
          return property;
        });
        return {
          ...note,
          properties: updatedProperties,
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
        };
      }
      return note;
    });
  };


  deleteProperty = (noteId: string, propertyId: string) => {
    const note = this.getNoteById(noteId);
    if (!note) throw new Error(`Note ${noteId} not found`);

    if (!note.properties.some(p => p.id === propertyId)) {
      throw new Error(`Property ${propertyId} not found in note ${noteId}`);
    }

    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          properties: note.properties.filter(p => p.id !== propertyId),
          metadata: note.metadata.map(prop =>
            prop.name === "modified"
              ? { ...prop, value: this.currentDate() }
              : prop
          )
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

  sanitizeTitle = (title: string) =>
    title.replace(/[\n\r]+/g, " ").trim().slice(0, 100);

  getNoteById = (id: string) => this.notes.find(note => note.id === id);

  getActiveNote = () => {
    if (!this.activeNoteId) return null;
    const note = this.getNoteById(this.activeNoteId);
    if (!note) {
      console.warn("Active note was removed, cleaning reference");
      this.activeNoteId = null;
    }
    return note;
  };

  setActiveNote = (id: string) => {
    if (id && !this.getNoteById(id)) {
      throw new Error(`Note ${id} not found`);
    }
    this.activeNoteId = id;
  };
}

export const noteController = $state(new NoteController());