// Estado y tipos para el Property Editor
export interface PropertyEditorState {
  isOpen: boolean;
  noteId: string | null;
  propertyId: string | null;
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

export enum FocusTarget {
  EDITOR = "editor",
  TITLE = "title",
  PROPERTY_EDITOR = "property-editor",
}

// Estado del sistema de foco
export interface FocusState {
  targetId: FocusTarget | null;
  timestamp: number;
}

// Estado global del workspace
export interface WorkspaceState {
  propertyEditor: PropertyEditorState;
  windows: Window[];
  activeWindowId: string | null;
  modal: {
    isOpen: boolean;
    content: any;
  };
  sidebar: {
    isOpen: boolean;
    width: number | null;
  };
}
