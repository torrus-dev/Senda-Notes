import {
   PenLineIcon,
   Trash2Icon,
   StarIcon,
   StarOffIcon,
   ArrowUpRight,
   SquarePlusIcon,
   FileSearchIcon,
   ReplaceIcon,
} from "lucide-svelte";
import type { MenuItem } from "@projectTypes/ui/contextMenuTypes";
import { noteController } from "@controllers/notes/noteController.svelte";

import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { focusController } from "@controllers/ui/focusController.svelte";
import { FocusTarget } from "@projectTypes/ui/uiTypes";
import { favoritesController } from "@controllers/notes/favoritesController.svelte";

export interface NoteMenuOptions {
   noteId: string;
   showCreateChild?: boolean;
   showOpenInNewTab?: boolean;
   showRename?: boolean;
   showDelete?: boolean;
   showFavorite?: boolean;
   showSearch?: boolean;
   showReplace?: boolean;
   onRename?: () => void;
   customItems?: MenuItem[];
}

export function getCommonNoteMenuItems(options: NoteMenuOptions): MenuItem[] {
   const {
      noteId,
      showCreateChild = true,
      showOpenInNewTab = true,
      showRename = false,
      showDelete = true,
      showFavorite = true,
      onRename,
      customItems = [],
   } = options;

   const isFavorited = $derived(favoritesController.isFavorite(noteId));
   const menuItems: MenuItem[] = [];

   // Navegación
   if (showOpenInNewTab) {
      menuItems.push({
         type: "action",
         label: "Abrir en pestaña nueva",
         icon: ArrowUpRight,
         action: () => {
            workspaceController.openNoteInNewTab(noteId);
         },
      });
   }

   // Creación
   if (showCreateChild) {
      menuItems.push({
         type: "action",
         label: "Nueva nota hija",
         icon: SquarePlusIcon,
         action: () => {
            noteController.createNote(noteId);
         },
      });
   }

   // Favoritos
   if (showFavorite) {
      menuItems.push({
         type: "action",
         label: !isFavorited ? "Agregar a favoritos" : "Quitar de favoritos",
         icon: !isFavorited ? StarIcon : StarOffIcon,
         action: () => {
            favoritesController.toggleFavorite(noteId);
         },
      });
   }

   // Edición
   if (showRename) {
      menuItems.push({
         type: "action",
         label: "Renombrar nota",
         icon: PenLineIcon,
         action: () => {
            if (onRename) {
               onRename();
            } else {
               focusController.requestFocus(FocusTarget.TITLE);
            }
         },
      });
   }

   // Items personalizados
   if (customItems.length > 0) {
      menuItems.push({ type: "separator" });
      menuItems.push(...customItems);
   }

   // Eliminación (siempre al final)
   if (showDelete) {
      menuItems.push({ type: "separator" });
      menuItems.push({
         type: "action",
         label: "Eliminar nota",
         icon: Trash2Icon,
         action: () => noteController.deleteNoteWithConfirmation(noteId),
         class: "text-error",
      });
   }

   return menuItems;
}
