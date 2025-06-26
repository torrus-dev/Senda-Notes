// notificationController.svelte.ts
import type {
   Notification,
   SnackbarType,
   SnackbarAction,
} from "@projectTypes/ui/uiTypes";

class NotificationController {
   notifications: Notification[] = $state([]);

   /**
    * Añade una nueva notificación al sistema.
    *
    * @returns El ID de la notificación creada
    */
   addNotification({
      message,
      type = "base",
      duration = 7000,
      action,
   }: {
      message: string;
      type?: SnackbarType;
      duration?: number;
      action?: SnackbarAction;
   }) {
      const id = crypto.randomUUID();

      const notification: Notification = {
         id,
         message,
         type,
         duration,
         action,
      };

      // Limitar a 5 notificaciones simultáneas para mejor UX
      if (this.notifications.length >= 2) {
         // Eliminar la más antigua
         this.notifications = this.notifications.slice(1);
      }

      this.notifications = [...this.notifications, notification];

      // Auto-eliminar después del tiempo especificado
      setTimeout(() => {
         this.removeNotification(id);
      }, duration);

      return id;
   }

   /**
    * Elimina una notificación específica por su ID
    */
   removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
   }

   /**
    * Elimina todas las notificaciones activas
    */
   clearAll() {
      this.notifications = [];
   }
}

// Singleton exportado como estado reactivo
export const notificationController = $state(new NotificationController());
