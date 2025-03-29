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
