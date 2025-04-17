import { Component } from "svelte";
import { workspaceStore } from "@stores/workspaceStore.svelte";

class WorkspaceController {
   // ---------- Sidebar ----------
   getActiveNoteId = () => workspaceStore.activeNoteId;
   setActiveNoteId = (newId: string) => {
      workspaceStore.previousActiveNoteId = workspaceStore.activeNoteId;
      workspaceStore.activeNoteId = newId;
   };
   unsetActiveNoteId = () => {
      workspaceStore.previousActiveNoteId = workspaceStore.activeNoteId;
      workspaceStore.activeNoteId = undefined;
   };

   // ---------- Modal ----------
   openModal = (modalContent: Component | undefined = undefined) => {
      workspaceStore.modal = {
         isOpen: true,
         content: modalContent,
      };
   };

   closeModal = () => {
      workspaceStore.modal = {
         isOpen: false,
         content: undefined,
      };
   };

   isModalOpen = () => {
      return workspaceStore.modal.isOpen;
   };

   getModalContent = () => {
      return workspaceStore.modal.content;
   };

   // ---------- Sidebar ----------
   setSidebarWidth = (newWidth: number) => {
      if (typeof newWidth === "number") {
         workspaceStore.sidebar.width = newWidth;
      }
   };

   getSidebarWidth = () => {
      return workspaceStore.sidebar.width;
   };

   toggleSidebar = () => {
      workspaceStore.sidebar.isOpen = !workspaceStore.sidebar.isOpen;
   };

   closeSidebar = () => {
      workspaceStore.sidebar.isOpen = false;
   };

   isSidebarOpen = () => {
      return workspaceStore.sidebar.isOpen;
   };

   isNotesCollapsed = () => workspaceStore.sidebar.notesCollapsed;
   setNotesCollapsed = () => workspaceStore.sidebar.notesCollapsed;

   toogleNotesCollapsed = () => {
      workspaceStore.sidebar.notesCollapsed =
         !workspaceStore.sidebar.notesCollapsed;
   };

   // ---------- Property Editor ----------
   openPropertyEditor = (
      noteId: string | null = null,
      propertyId: string | null = null,
   ) => {
      workspaceStore.propertyEditor = {
         isOpen: true,
         noteId: noteId,
         propertyId: propertyId,
      };
   };

   closePropertyEditor = () => {
      workspaceStore.propertyEditor = {
         isOpen: false,
         noteId: null,
         propertyId: null,
      };
   };

   isOpenPropertyEditor = (
      noteId: string | null = null,
      propertyId: string | null = null,
   ) => {
      return (
         workspaceStore.propertyEditor.isOpen &&
         workspaceStore.propertyEditor.noteId === noteId &&
         workspaceStore.propertyEditor.propertyId === propertyId
      );
   };

   // Editor
   isEditorMetadataCollapsed = () => {
      return workspaceStore.editor.metadataCollapsed;
   };
   toggleEditorMetadataCollapsed = () => {
      workspaceStore.editor.metadataCollapsed =
         !workspaceStore.editor.metadataCollapsed;
   };
   isEditorChildrenCollapsed = () => {
      return workspaceStore.editor.childrenCollapsed;
   };
   toggleEditorChildrenCollapsed = () => {
      workspaceStore.editor.childrenCollapsed =
         !workspaceStore.editor.childrenCollapsed;
   };
   isEditorPropertiesCollapsed = () => {
      console.log(
         "cargando props cola",
         workspaceStore.editor.propertiesCollapsed,
      );
      return workspaceStore.editor.propertiesCollapsed;
   };
   toggleEditorPropertiesCollapsed = () => {
      workspaceStore.editor.propertiesCollapsed =
         !workspaceStore.editor.propertiesCollapsed;

      console.log("props cola", workspaceStore.editor.propertiesCollapsed);
   };
}

export const workspace = $state(new WorkspaceController());
