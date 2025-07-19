import { NoteUseCases } from "@application/usecases/NoteUseCases";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { focusController } from "@controllers/ui/focusController.svelte";
import { FocusTarget } from "@projectTypes/ui/uiTypes";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { notificationController } from "@controllers/application/notificationController.svelte";
import { globalConfirmationDialog } from "@controllers/menu/confirmationDialogController.svelte";

/**
 * Controlador delgado para coordinar UI con casos de uso
 */
class NoteController {
   // Estado reactivo para Svelte 5
   noteCount = $state(0);
   lastUpdated = $state<Date>(new Date());

   private get useCases(): NoteUseCases {
      return startupManager.getService("noteUseCases");
   }

   /**
    * Crea una nota y la abre
    */
   createNote(
      parentId?: string,
      params?: {
         title?: string;
         content?: string;
         icon?: string;
      },
   ): void {
      const noteId = this.useCases.createNote({
         parentId,
         ...params,
      });

      if (noteId) {
         this.openAndFocusNote(noteId);
         this.updateReactiveState();
      }
   }

   /**
    * Crea notas desde un path
    */
   createNoteFromPath(path: string): string | null {
      const noteId = this.useCases.createNoteFromPath(path);

      if (noteId) {
         this.openAndFocusNote(noteId);
         this.updateReactiveState();
      }

      return noteId;
   }

   /**
    * Actualiza el título de una nota
    */
   updateNoteTitle(noteId: string, title: string): void {
      const queryRepo = startupManager.getService("noteQueryRepository");
      const note = queryRepo.findById(noteId);

      if (note) {
         note.updateTitle(title);
         const noteRepositoryService =
            startupManager.getService("noteRepository");
         noteRepositoryService.update(noteId, note);
         this.updateReactiveState();
      }
   }

   /**
    * Actualiza el contenido de una nota
    */
   updateNoteContent(noteId: string, content: string, stats?: any): void {
      this.useCases.updateNoteContent(noteId, content, stats);
      this.updateReactiveState();
   }

   /**
    * Elimina una nota con confirmación
    */
   deleteNoteWithConfirmation(noteId: string): void {
      const queryRepo = startupManager.getService("noteQueryRepository");
      const note = queryRepo.findById(noteId);

      if (!note) return;

      globalConfirmationDialog.show({
         title: "Borrar Nota",
         message:
            "¿Seguro que quieres borrar esta nota? Esta acción no puede deshacerse.",
         variant: "danger",
         onAccept: () => this.deleteNote(noteId),
      });
   }

   /**
    * Elimina una nota
    */
   private deleteNote(noteId: string): void {
      const queryRepo = startupManager.getService("noteQueryRepository");
      const note = queryRepo.findById(noteId);

      if (!note) return;

      // Cerrar tab si está abierta
      if (workspaceController.activeNoteId === noteId) {
         workspaceController.closeTabByTabId(noteId);
      }

      this.useCases.deleteNote(noteId);
      this.updateReactiveState();

      notificationController.addNotification({
         message: `Nota "${note.title}" eliminada.`,
         type: "base",
      });
   }

   /**
    * Mueve una nota
    */
   moveNote(
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void {
      try {
         this.useCases.moveNote(noteId, newParentId, position);
         this.updateReactiveState();
      } catch (error) {
         console.error("Error moving note:", error);
         notificationController.addNotification({
            message: `Error al mover la nota: ${error}`,
            type: "error",
         });
      }
   }

   /**
    * Actualiza el estado reactivo
    */
   private updateReactiveState(): void {
      const queryRepo = startupManager.getService("noteQueryRepository");
      this.noteCount = queryRepo.count();
      this.lastUpdated = new Date();
   }

   /**
    * Abre y enfoca una nota
    */
   private openAndFocusNote(noteId: string): void {
      workspaceController.openNote(noteId);
      focusController.requestFocus(FocusTarget.TITLE);
   }
}

// Singleton con proxy para lazy loading
let instance: NoteController | null = null;

export const noteController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new NoteController();
         const value = instance[prop as keyof NoteController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as NoteController;
