import type { Note, Property } from "./types/notes";

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
    { name: "created", value: this.currentDate(), type: "datetime" },
    { name: "modified", value: this.currentDate(), type: "datetime" }
  ];

  // currentDate = (): string => {
  //   return new Date().toISOString();
  // };

  currentDate = (): string => new Date().toISOString();


  updateNote = (id: string, updates: Partial<Note>) => {
    this.notes = this.notes.map(note =>
      note.id === id ? this.applyNoteUpdates(note, updates) : note
    );
  };

  private applyNoteUpdates = (note: Note, updates: Partial<Note>): Note => {
    const newUpdatedTime: Property = { name: "modified", value: this.currentDate(), type: "datetime" }

    const updatedMetadata = note.metadata.map(property =>
      property.name === "modified" ? newUpdatedTime : property
    );

    return {
      ...note,
      ...updates,
      metadata: updatedMetadata,
      title: this.sanitizeTitle(updates.title || note.title),
      properties: updates.properties ?? note.properties
    };
  };

  // Obtener el valor predeterminado para un tipo de propiedad
  getDefaultValue(type: Property["type"]) {
    switch (type) {
      case "text":
        return ""; // Valor predeterminado para texto
      case "list":
        return []; // Valor predeterminado para lista (vacía)
      case "number":
        return 0; // Valor predeterminado para número
      case "check":
        return false; // Valor predeterminado para checkbox
      case "date":
        return new Date().toISOString().split("T")[0]; // Fecha actual (formato YYYY-MM-DD)
      case "datetime":
        return new Date().toISOString(); // Fecha y hora actual (formato ISO)
      default:
        throw new Error(`Tipo de propiedad no soportado: ${type}`);
    }
  }

  sanitizeTitle = (title: string) =>
    title.replace(/[\n\r]+/g, "").slice(0, 100);


  getNoteById = (id: string) => this.notes.find(note => note.id === id);
  getActiveNote = () => {
    if (this.activeNoteId) {
      return this.getNoteById(this.activeNoteId);
    }
    return null;
  }
  setActiveNote = (id: string) => { this.activeNoteId = id; };


  deleteNote = (id: string) => {
    this.notes = this.notes.filter(note => note.id !== id);
    if (this.activeNoteId === id) this.activeNoteId = null;
  };
}

export const noteController = $state(new NoteController());