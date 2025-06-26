// UI MODE
export type UiModeType = "light" | "dark" | "system";

// DRAG & DROP
export type DragSource = {
   id?: string;
   type: "notetree-note" | "tab" | "property" | "other";
   position: number;
   data?: any;
};

export type DropTarget = {
   id?: string;
   type: "notetree-note" | "notetree-line" | "tab-area" | "property" | "other";
   position: number;
   data?: any;
};

// NOTIFICATIONS
export type SnackbarType = "base" | "success" | "error" | "info" | "warning";

export interface SnackbarAction {
   label: string;
   onClick: () => void;
}

export interface Notification {
   id: string; // único
   type: SnackbarType;
   message: string;
   duration?: number; // en ms, por defecto 3000 o 5000
   action?: SnackbarAction;
}

// FOCUS
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
