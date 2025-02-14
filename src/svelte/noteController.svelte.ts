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

  createNote = (parentId?: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: this.generateUniqueTitle(),
      children: [],
      content: "",
      metadata: this.createDefaultMetadata(),
      properties: [],
    };

    this.notes = [...this.notes, newNote];

    if (parentId) {
      this.addChildToParent(parentId, newNote.id);
    }

    this.activeNoteId = newNote.id;
  };


  private addChildToParent = (parentId: string, childId: string) => {
    this.notes = this.notes.map(note => {
      if (note.id === parentId && !note.children.includes(childId)) {
        return { ...note, children: [...note.children, childId] };
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
    this.notes = this.notes.map(note => {
      if (note.id === id) {
        const updatedMetadata: Property[] = note.metadata.map(property => {
          if (property.name === "modified") {
            return { ...property, value: this.currentDate() };
          }
          return property;
        });

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
    const idsToDelete = this.getDescendantIds(id);
    idsToDelete.push(id);

    // Eliminar notas
    this.notes = this.notes.filter(note => !idsToDelete.includes(note.id));

    // Limpiar referencias en children de otras notas
    this.notes = this.notes.map(note => ({
      ...note,
      children: note.children.filter(childId => !idsToDelete.includes(childId))
    }));

    // Limpiar activeNote si corresponde
    if (this.activeNoteId && idsToDelete.includes(this.activeNoteId)) {
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
    // Eliminar de todos los padres actuales
    this.notes = this.notes.map(note => ({
      ...note,
      children: note.children.filter(id => id !== noteId)
    }));

    // Agregar al nuevo padre (si no es root)
    if (newParentId) {
      this.addChildToParent(newParentId, noteId);
    }
  };

  reorderChildren = (parentId: string, newChildrenOrder: string[]) => {
    this.notes = this.notes.map(note => {
      if (note.id === parentId) {
        return { ...note, children: newChildrenOrder };
      }
      return note;
    });
  };

  createProperty = (noteId: string, property: Omit<Property, "id">) => {
    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        const newProperty: Property = {
          ...property,
          id: crypto.randomUUID(),
          value: property.value ?? this.getDefaultTypeValue(property.type)
        };
        return {
          ...note,
          properties: [...note.properties, newProperty]
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
        return { ...note, properties: updatedProperties };
      }
      return note;
    });
  };

  deleteProperty = (noteId: string, propertyId: string) => {
    this.notes = this.notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          properties: note.properties.filter(p => p.id !== propertyId)
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
        throw new Error(`Tipo no soportado: ${type}`);
    }
  }

  sanitizeTitle = (title: string) =>
    title.replace(/[\n\r]+/g, "").slice(0, 100);

  getNoteById = (id: string) => this.notes.find(note => note.id === id);

  getActiveNote = () => {
    if (!this.activeNoteId) return null;
    const note = this.getNoteById(this.activeNoteId);
    if (!note) this.activeNoteId = null;
    return note;
  };

  setActiveNote = (id: string) => {
    this.activeNoteId = id;
  };
}

export const noteController = $state(new NoteController());