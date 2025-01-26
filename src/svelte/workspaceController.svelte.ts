import Property from "./components/Property.svelte"

interface PropertyEditor {
  isVisible: boolean,
  targetNoteId: string | null
  editingProperty: Property | null
}

class WorkspaceController {
  activeNoteID = $state(null)
  propertyEditor = $state(<PropertyEditor>{
    isVisible: false,
    targetNoteId: null,
    editingProperty: null,
  })

  closePropertyEditor = () => {
    this.propertyEditor = {
      isVisible: false,
      editingProperty: null,
      targetNoteId: null,
    }
  }

  openPropertyEditor = (noteId: string | null, property = null) => {
    if (noteId) {
      this.propertyEditor = {
        isVisible: true,
        targetNoteId: noteId,
        editingProperty: property,
      }
    }
  }
}

export const workspace = $state(new WorkspaceController);

