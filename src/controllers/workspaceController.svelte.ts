import { Component } from "svelte";
import { workspaceModel } from "@model/workspaceModel.svelte";

class WorkspaceController {
   // ---------- Sidebar ----------
   getActiveNoteId = () => workspaceModel.activeNoteId;
   setActiveNoteId = (newId: string) => {
      workspaceModel.previousActiveNoteId = workspaceModel.activeNoteId;
      workspaceModel.activeNoteId = newId;
   };
   unsetActiveNoteId = () => {
      workspaceModel.previousActiveNoteId = workspaceModel.activeNoteId;
      workspaceModel.activeNoteId = undefined;
   };

   // ---------- Modal ----------
   openModal = (modalContent: Component | undefined = undefined) => {
      workspaceModel.modal = {
         isOpen: true,
         content: modalContent,
      };
   };

   closeModal = () => {
      workspaceModel.modal = {
         isOpen: false,
         content: undefined,
      };
   };

   isModalOpen = () => {
      return workspaceModel.modal.isOpen;
   };

   getModalContent = () => {
      return workspaceModel.modal.content;
   };

   // ---------- Sidebar ----------
   setSidebarWidth = (newWidth: number) => {
      if (typeof newWidth === "number") {
         workspaceModel.sidebar.width = newWidth;
      }
   };

   getSidebarWidth = () => {
      return workspaceModel.sidebar.width;
   };

   toggleSidebar = () => {
      workspaceModel.sidebar.isOpen = !workspaceModel.sidebar.isOpen;
   };

   closeSidebar = () => {
      workspaceModel.sidebar.isOpen = false;
   };

   isSidebarOpen = () => {
      return workspaceModel.sidebar.isOpen;
   };

   // ---------- Property Editor ----------
   toggleEditProperty = (noteId: string, propertyId: string) => {
      workspaceModel.propertyEditor = {
         isOpen: true,
         noteId: noteId,
         propertyId: propertyId,
      };
   };

   toggleAddProperty = () => {
      workspaceModel.propertyEditor = {
         isOpen: true,
         noteId: undefined,
         propertyId: undefined,
      };
   };

   stopPropertyEdit = () => {
      workspaceModel.propertyEditor = {
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
         workspaceModel.propertyEditor.isOpen &&
         workspaceModel.propertyEditor.noteId === noteId &&
         workspaceModel.propertyEditor.propertyId === propertyId
      );
   };

   isAddingProperty = () => {
      return (
         workspaceModel.propertyEditor.isOpen &&
         workspaceModel.propertyEditor.noteId === undefined &&
         workspaceModel.propertyEditor.propertyId === undefined
      );
   };
}

export const workspace = $state(new WorkspaceController());
