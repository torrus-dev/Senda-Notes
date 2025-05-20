import { dndController } from "@controllers/dndController.svelte";
import { NoteProperty } from "@projectTypes/propertyTypes";

export function createDragAndDropHandlers(params: {
   noteId: string | null;
   property: NoteProperty;
   getPosition: () => number;
   setIsDraggedOver: (val: boolean) => void;
}) {
   const { noteId, property, getPosition, setIsDraggedOver } = params;

   const handleDragStart = (event: DragEvent) => {
      event.stopPropagation();

      if (dndController.isDragging) return;

      dndController.setDragSource({
         id: property.id,
         type: "property",
         position: getPosition(),
         data: {
            noteId: noteId,
         },
      });

      if (event.dataTransfer) {
         event.dataTransfer.effectAllowed = "move";
      }
   };

   const handleDragEnd = (_event: DragEvent) => {
      dndController.clearDragAndDrop();
   };

   const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggedOver(true);
   };

   const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      setIsDraggedOver(false);
   };

   const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!dndController.isDragging) return;

      setIsDraggedOver(false);
      // aqui estamos definiendo el que ocurre cuando se hace drop sobre el elemento, no queremos coger el event.target ya que cada property define este evento
      dndController.setDropTarget({
         id: property.id,
         type: "property",
         position: getPosition(),
      });
      dndController.handleDrop();
   };

   return {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
   };
}
