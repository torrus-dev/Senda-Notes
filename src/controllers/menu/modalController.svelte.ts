import { Component } from "svelte";

interface ModalState {
   isOpen: boolean;
   title: string;
   content: any;
}

class ModalController {
   data: ModalState = $state({
      isOpen: false,
      title: "",
      content: undefined,
   });

   open(title: string, modalContent: Component | undefined = undefined) {
      if (!title.trim()) {
         console.warn("Modal title cannot be empty");
         return;
      }
      this.data.isOpen = true;
      this.data.title = title;
      this.data.content = modalContent;
   }

   close() {
      this.data.isOpen = false;
      this.data.title = "";
      this.data.content = undefined;
   }

   get isOpen() {
      return this.data.isOpen;
   }

   get title() {
      return this.data.title;
   }

   get content() {
      return this.data.content;
   }
}

export const modalController = $state(new ModalController());
