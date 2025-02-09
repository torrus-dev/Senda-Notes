export interface Property {
  id: string;
  name: string;
  value: string | string[] | number | boolean | Date;
  type: "text" | "list" | "number" | "check" | "date" | "datetime";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  metadata: Property[];
  properties: Property[];
}

// Estado y tipos para el Property Editor
export interface PropertyEditorState {
  isVisible: boolean;
  targetNoteId: string | null;
  editingProperty: Property | null;
  originalName: string | null;
}

// Tipos para pestañas (tabs) y ventanas
export interface Tab {
  id: string;
  noteId: string;
  title: string;
}

export interface Window {
  id: string;
  tabs: Tab[];
  activeTabId: string | null;
}

// Estado global del workspace
export interface WorkspaceState {
  propertyEditor: PropertyEditorState;
  windows: Window[];
  activeWindowId: string | null;
}
