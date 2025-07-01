import { workspaceModel } from "@model/navigation/workspaceModel.svelte";
import type { Note } from "@projectTypes/core/noteTypes";

class WorkspaceController {
   // Getter para mantener compatibilidad con el código existente
   get activeNoteId(): string | undefined {
      return workspaceModel.data.activeTabId;
   }

   // Setter que actualiza tanto la pestaña activa como añade la nota a las pestañas si no existe
   set activeNoteId(newId: string) {
      this.openNoteInTab(newId);
   }

   // Método para abrir una nota en una nueva pestaña o activar una existente
   openNoteInTab(noteId: string) {
      const tabs = workspaceModel.data.tabs;

      // Si la nota ya está en una pestaña, simplemente la activamos
      if (tabs.includes(noteId)) {
         workspaceModel.data.activeTabId = noteId;
      } else {
         // Si no existe, la añadimos a las pestañas y la activamos
         tabs.push(noteId);
         workspaceModel.data.activeTabId = noteId;
      }
   }

   // Cerrar una pestaña específica
   closeTab(noteId: string) {
      const tabs = workspaceModel.data.tabs;
      const tabIndex = tabs.indexOf(noteId);

      if (tabIndex === -1) return; // La pestaña no existe

      // Eliminar la pestaña del array
      tabs.splice(tabIndex, 1);

      // Si cerramos la pestaña activa, necesitamos activar otra
      if (workspaceModel.data.activeTabId === noteId) {
         if (tabs.length === 0) {
            // No quedan pestañas
            workspaceModel.data.activeTabId = undefined;
         } else {
            // Activar la pestaña anterior o la primera disponible
            const newActiveIndex = Math.max(0, tabIndex - 1);
            workspaceModel.data.activeTabId = tabs[newActiveIndex];
         }
      }
   }

   // Activar una pestaña específica
   activateTab(noteId: string) {
      if (workspaceModel.data.tabs.includes(noteId)) {
         workspaceModel.data.activeTabId = noteId;
      }
   }

   // Cerrar todas las pestañas
   closeAllTabs() {
      workspaceModel.data.tabs = [];
      workspaceModel.data.activeTabId = undefined;
   }

   // Cerrar todas las pestañas excepto la activa
   closeOtherTabs() {
      const activeId = workspaceModel.data.activeTabId;
      if (activeId) {
         workspaceModel.data.tabs = [activeId];
      } else {
         this.closeAllTabs();
      }
   }

   // Mover una pestaña a una nueva posición
   moveTab(fromIndex: number, toIndex: number) {
      const tabs = workspaceModel.data.tabs;
      if (
         fromIndex < 0 ||
         fromIndex >= tabs.length ||
         toIndex < 0 ||
         toIndex >= tabs.length
      ) {
         return;
      }

      const [movedTab] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, movedTab);
   }

   // Método de compatibilidad para limpiar la nota activa
   unsetActiveNoteId() {
      this.closeAllTabs();
   }

   // Getters útiles para el sistema de pestañas
   get tabs(): Note["id"][] {
      return workspaceModel.data.tabs;
   }

   get hasActiveTabs(): boolean {
      return workspaceModel.data.tabs.length > 0;
   }

   get activeTabIndex(): number {
      const activeId = workspaceModel.data.activeTabId;
      return activeId ? workspaceModel.data.tabs.indexOf(activeId) : -1;
   }

   // Navegación entre pestañas
   nextTab() {
      const tabs = workspaceModel.data.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      const nextIndex = (currentIndex + 1) % tabs.length;
      this.activateTab(tabs[nextIndex]);
   }

   previousTab() {
      const tabs = workspaceModel.data.tabs;
      if (tabs.length <= 1) return;

      const currentIndex = this.activeTabIndex;
      const prevIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
      this.activateTab(tabs[prevIndex]);
   }

   // Verificar si una nota está abierta en una pestaña
   isNoteOpenInTab(noteId: string): boolean {
      return workspaceModel.data.tabs.includes(noteId);
   }
}

export const workspaceController = $state(new WorkspaceController());
