import { editorModel } from "@model/editorModel.svelte";

class EditorController {
   set contentSaved(newValue: boolean) {
      editorModel.contentSaved = newValue;
   }
   get contentSaved() {
      return editorModel.contentSaved;
   }

   // Stats
   set chararecterCount(newValue: number) {
      editorModel.chararecterCount = newValue;
   }
   get chararecterCount() {
      return editorModel.chararecterCount;
   }
   set wordCount(newValue: number) {
      editorModel.wordCount = newValue;
   }
   get wordCount() {
      return editorModel.wordCount;
   }
   set lineCount(newValue: number) {
      editorModel.lineCount = newValue;
   }
   get lineCount() {
      return editorModel.lineCount;
   }
}

export const editorController = $state(new EditorController());
