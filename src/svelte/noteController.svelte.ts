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

  createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: this.generateUniqueTitle(),
      content: "",
      metadata: this.createDefaultMetadata(),
      properties: [],
    };

    this.notes = [...this.notes, newNote];
    this.activeNoteId = newNote.id;
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
    this.notes = this.notes.filter(note => note.id !== id);
    if (this.activeNoteId === id) this.activeNoteId = null;
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