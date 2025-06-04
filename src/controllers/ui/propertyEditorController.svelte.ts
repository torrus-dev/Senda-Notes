export interface PropertyEditorState {
   isOpen: boolean;
   noteId: string | undefined;
   propertyId: string | undefined;
}

class PropertyEditorController {
   data: PropertyEditorState = $state({
      isOpen: false,
      noteId: undefined,
      propertyId: undefined,
   });

   startEditProperty(noteId: string, propertyId: string) {
      this.data.isOpen = true;
      this.data.noteId = noteId;
      this.data.propertyId = propertyId;
   }

   startAddProperty() {
      this.data.isOpen = true;
      this.data.noteId = undefined;
      this.data.propertyId = undefined;
   }

   stop() {
      this.data.isOpen = false;
      this.data.noteId = undefined;
      this.data.propertyId = undefined;
   }

   close() {
      this.stop();
   }

   isEditingProperty(noteId?: string, propertyId?: string) {
      return (
         this.data.isOpen &&
         this.data.noteId === noteId &&
         this.data.propertyId === propertyId
      );
   }

   isAddingProperty() {
      return (
         this.data.isOpen &&
         this.data.noteId === undefined &&
         this.data.propertyId === undefined
      );
   }

   isOpen() {
      return this.data.isOpen;
   }

   getCurrentNoteId() {
      return this.data.noteId;
   }

   getCurrentPropertyId() {
      return this.data.propertyId;
   }

   // Getter para acceso directo al estado
   get state() {
      return this.data;
   }
}

export const propertyEditorController = $state(new PropertyEditorController());
