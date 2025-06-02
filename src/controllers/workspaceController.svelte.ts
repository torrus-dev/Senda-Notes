import { Component } from "svelte";
import { workspaceStore } from "modal/workspaceStore.svelte";

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

   // ---------- Property Editor ----------
   toggleEditProperty = (noteId: string, propertyId: string) => {
      workspaceStore.propertyEditor = {
         isOpen: true,
         noteId: noteId,
         propertyId: propertyId,
      };
   };

   toggleAddProperty = () => {
      workspaceStore.propertyEditor = {
         isOpen: true,
         noteId: undefined,
         propertyId: undefined,
      };
   };

   stopPropertyEdit = () => {
      workspaceStore.propertyEditor = {
         isOpen: false,
         noteId: undefined,
         propertyId: undefined,
      };
   };

   isEditingProperty = (
      noteId: string | undefined = undefined,
      propertyId: string | undefined = undefined,
   ) => {
      return (
         workspaceStore.propertyEditor.isOpen &&
         workspaceStore.propertyEditor.noteId === noteId &&
         workspaceStore.propertyEditor.propertyId === propertyId
      );
   };

   isAddingProperty = () => {
      return (
         workspaceStore.propertyEditor.isOpen &&
         workspaceStore.propertyEditor.noteId === undefined &&
         workspaceStore.propertyEditor.propertyId === undefined
      );
   };
}

export const workspace = $state(new WorkspaceController());
