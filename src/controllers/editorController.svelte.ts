import { editorStore } from "@model/editorStore.svelte";

class EditorController {
   set contentSaved(newValue: boolean) {
      editorStore.contentSaved = newValue;
   }
   get contentSaved() {
      return editorStore.contentSaved;
   }

   // Stats
   set chararecterCount(newValue: number) {
      editorStore.chararecterCount = newValue;
   }
   get chararecterCount() {
      return editorStore.chararecterCount;
   }
   set wordCount(newValue: number) {
      editorStore.wordCount = newValue;
   }
   get wordCount() {
      return editorStore.wordCount;
   }
   set lineCount(newValue: number) {
      editorStore.lineCount = newValue;
   }
   get lineCount() {
      return editorStore.lineCount;
   }
}

export const editorController = $state(new EditorController());
