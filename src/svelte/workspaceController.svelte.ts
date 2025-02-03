import type { Property } from "./types/notes";

interface PropertyEditorState {
  isVisible: boolean;
  targetNoteId: string | null;
  editingProperty: Property | null;
  originalName: string | null;
}

class WorkspaceController {
  propertyEditor = $state<PropertyEditorState>({
    isVisible: false,
    targetNoteId: null,
    editingProperty: null,
    originalName: null,
  });

  openPropertyEditor = (noteId: string, property: Property | null = null) => {
    this.propertyEditor = {
      isVisible: true,
      targetNoteId: noteId,
      editingProperty: property ? { ...property } : null,
      originalName: property?.name || null,
    };
  };

  closePropertyEditor = () => {
    this.propertyEditor = {
      isVisible: false,
      targetNoteId: null,
      editingProperty: null,
      originalName: null,
    };
  };

  isEditing = (noteId: string) => {
    return (
      this.propertyEditor.isVisible &&
      this.propertyEditor.targetNoteId === noteId
    );
  };

  updateEditingProperty = (updates: Partial<Property>) => {
    if (this.propertyEditor.editingProperty) {
      this.propertyEditor.editingProperty = {
        ...this.propertyEditor.editingProperty,
        ...updates,
      };
    }
  };
}

export const workspace = $state(new WorkspaceController());