import { dndController } from "../../../controllers/dndController.svelte";

export function createDragAndDropHandlers(params: {
  noteId: string | number | null;
  property: { id: string | number; type: string; value: any; name: string };
  position: number;
  setIsDraggedOver: (val: boolean) => void;
}) {
  const { noteId, property, position, setIsDraggedOver } = params;

  const handleDragStart = (event: DragEvent) => {
    event.stopPropagation();
    dndController.setDragSource({
      type: "property",
      data: {
        noteId: noteId,
        propertyId: property.id,
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
    setIsDraggedOver(false);
    dndController.setDropTarget({
      type: "property-line",
      data: {
        position: position,
      },
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
