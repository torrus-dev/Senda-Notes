import { Component } from "svelte";

interface ModalState {
   isOpen: boolean;
   content: any;
}

class ModalController {
   data: ModalState = $state({
      isOpen: false,
      content: undefined,
   });

   open(modalContent: Component | undefined = undefined) {
      this.data.isOpen = true;
      this.data.content = modalContent;
   }

   close() {
      this.data.isOpen = false;
      this.data.content = undefined;
   }

   isOpen() {
      return this.data.isOpen;
   }

   getContent() {
      return this.data.content;
   }

   // Getter para acceso directo al estado
   get state() {
      return this.data;
   }
}

export const modalController = $state(new ModalController());
