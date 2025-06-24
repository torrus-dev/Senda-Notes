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

// Properties
export interface NoteTreeLineData {
   parentId?: string;
   position: number;
}

export interface PropertyLineData {
   position: number;
}
