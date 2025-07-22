// src/domain/services/WorkspaceService.ts
import type { Tab } from "@projectTypes/ui/uiTypes";
import { Note } from "@domain/entities/Note";

export interface TabNavigationDecision {
   action: "activate" | "switch" | "create";
   targetTabId?: string;
   targetNoteId: string;
}

export interface TabClosureResult {
   newActiveTabId?: string;
   closedTabId: string;
}

export class WorkspaceService {
   /**
    * Determina la mejor acción al abrir una nota
    */
   determineOpenNoteAction(
      noteId: string,
      tabs: Tab[],
      activeTabId?: string,
   ): TabNavigationDecision {
      // Verificar si la nota ya está abierta
      const existingTab = tabs.find(
         (tab) => tab.noteReference?.noteId === noteId,
      );
      if (existingTab) {
         return {
            action: "activate",
            targetTabId: existingTab.id,
            targetNoteId: noteId,
         };
      }

      // Si hay una pestaña activa, cambiar su contenido
      if (activeTabId) {
         return {
            action: "switch",
            targetTabId: activeTabId,
            targetNoteId: noteId,
         };
      }

      // Si no hay pestañas activas, crear una nueva
      return {
         action: "create",
         targetNoteId: noteId,
      };
   }

   /**
    * Determina qué pestaña activar después de cerrar una
    */
   determineNextActiveTab(
      closingTabId: string,
      tabs: Tab[],
      currentActiveTabId?: string,
   ): string | undefined {
      const tabIndex = tabs.findIndex((tab) => tab.id === closingTabId);
      if (tabIndex === -1) return currentActiveTabId;

      // Si no es la pestaña activa, mantener la actual
      if (currentActiveTabId !== closingTabId) {
         return currentActiveTabId;
      }

      // Si no quedan más pestañas después de cerrar
      const remainingTabs = tabs.filter((tab) => tab.id !== closingTabId);
      if (remainingTabs.length === 0) {
         return undefined;
      }

      // Activar la pestaña anterior o la primera disponible
      const newActiveIndex = Math.max(0, tabIndex - 1);
      return remainingTabs[newActiveIndex]?.id;
   }

   /**
    * Calcula el índice de la siguiente pestaña en navegación circular
    */
   getNextTabIndex(currentIndex: number, totalTabs: number): number {
      if (totalTabs <= 1) return currentIndex;
      return (currentIndex + 1) % totalTabs;
   }

   /**
    * Calcula el índice de la pestaña anterior en navegación circular
    */
   getPreviousTabIndex(currentIndex: number, totalTabs: number): number {
      if (totalTabs <= 1) return currentIndex;
      return currentIndex <= 0 ? totalTabs - 1 : currentIndex - 1;
   }

   /**
    * Determina qué pestañas están a la izquierda de la pestaña dada
    */
   getTabsToLeft(tabId: string, tabs: Tab[]): Tab[] {
      const targetIndex = tabs.findIndex((tab) => tab.id === tabId);
      if (targetIndex === -1) return [];

      return tabs.slice(0, targetIndex);
   }

   /**
    * Determina qué pestañas están a la derecha de la pestaña dada
    */
   getTabsToRight(tabId: string, tabs: Tab[]): Tab[] {
      const targetIndex = tabs.findIndex((tab) => tab.id === tabId);
      if (targetIndex === -1) return [];

      return tabs.slice(targetIndex + 1);
   }

   /**
    * Valida si un movimiento de pestaña es válido
    */
   isValidTabMove(
      fromIndex: number,
      toIndex: number,
      totalTabs: number,
   ): boolean {
      return (
         fromIndex >= 0 &&
         fromIndex < totalTabs &&
         toIndex >= 0 &&
         toIndex < totalTabs &&
         fromIndex !== toIndex
      );
   }

   /**
    * Genera un nuevo ID único para una pestaña
    */
   generateTabId(): string {
      return crypto.randomUUID();
   }
}
