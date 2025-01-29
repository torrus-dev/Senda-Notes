import type { Property } from "./types/notes";

interface PropertyEditor {
  isVisible: boolean;
  targetNoteId: string | null;
  editingProperty: Property | null;
  originalName: string | null;
}

class WorkspaceController {
  activeNoteID = $state<string | null>(null);
  propertyEditor = $state<PropertyEditor>({
    isVisible: false,
    targetNoteId: null,
    editingProperty: null,
    originalName: null,
  });

  closePropertyEditor = () => {
    this.propertyEditor = {
      isVisible: false,
      targetNoteId: null,
      editingProperty: null,
      originalName: null,
    };
  };

  openPropertyEditor = (noteId: string, property: Property | null = null) => {
    this.propertyEditor = {
      isVisible: true,
      targetNoteId: noteId,
      editingProperty: property ? { ...property } : null,
      originalName: property?.name || null,
    };
  };
}

export const workspace = $state(new WorkspaceController());