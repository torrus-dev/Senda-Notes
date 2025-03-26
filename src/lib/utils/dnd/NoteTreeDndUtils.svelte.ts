import { isDescendant } from "../noteUtils";
import { dndController } from "../../../controllers/dndController.svelte";
import { noteController } from "../../../controllers/noteController.svelte";

// Handlers para NoteTreeNode
export function createNoteTreeNodeDndHandlers(params: {
   noteId: string;
   parentId?: string;
   children?: string[];
   getNotePosition: () => number;
   setIsDraggedOver: (val: boolean) => void;
   getBranchDragging: () => boolean;
}) {
   const {
      noteId,
      parentId,
      children,
      getNotePosition,
      setIsDraggedOver,
      getBranchDragging,
   } = params;

   const handleDragStart = (event: DragEvent) => {
      event.stopPropagation();
      dndController.setDragSource({
         id: noteId,
         type: "notetree-note",
         position: getNotePosition(),
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

      // Verificación para evitar indicador de drop en nodos hijos
      if (getBranchDragging()) {
         return;
      }
      console.log("Drag over sobre una nota valida");
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

      if (getBranchDragging()) {
         console.error("Cannot drop parent note into a child note");
         return;
      }

      let dragSourceId = dndController.getDragSourceId();
      if (!dragSourceId || dragSourceId === noteId) {
         setIsDraggedOver(false);
         return;
      }

      dndController.setDropTarget({
         id: noteId,
         position: getNotePosition(),
         type: "notetree-note",
         data: {
            parentId: parentId,
         },
      });

      // finalmente el controlador se encarga de manejar el drop
      dndController.handleDrop();
      dndController.clearDragAndDrop();
   };

   return {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
   };
}

// Handlers para NoteTreeLine
export function createNoteTreeLineDndHandlers(params: {
   parentId: string | undefined;
   getLinePosition: () => number;
   setIsDraggedOver: (val: boolean) => void;
   getBranchDragging: () => boolean;
}) {
   const { parentId, getLinePosition, setIsDraggedOver, getBranchDragging } =
      params;

   // Las lineas no necesitan metodos para drag start ni drag end

   const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // Verificación para evitar indicador de drop en nodos hijos
      if (getBranchDragging()) {
         return;
      }
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

      // Si se intenta arrastrar una nota padre a una note-line que se encuentre en un nivel inferior de la rama, no ocurre nada
      if (getBranchDragging()) {
         console.error("Cannot drop parent note into a child note-line");
         return;
      }

      dndController.setDropTarget({
         type: "notetree-line",
         position: getLinePosition(),
         data: {
            parentId: parentId,
         },
      });

      // finalmente el controlador se encarga de manejar el drop
      dndController.handleDrop();
      dndController.clearDragAndDrop();
   };

   return {
      handleDragOver,
      handleDragLeave,
      handleDrop,
   };
}

export function checkDraggingBranch(noteId: string) {
   let dragSourceId = dndController.getDragSourceId();
   if (dragSourceId && noteId) {
      if (dragSourceId === noteId) {
         return true;
      } else {
         return isDescendant(noteController.notes, noteId, dragSourceId);
      }
   }
   return false;
}
