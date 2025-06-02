interface EditorData {
   contentSaved: boolean;
   wordCount: number;
   chararecterCount: number;
   lineCount: number;
}

class EditorStore {
   data: EditorData = $state({
      contentSaved: true,
      wordCount: 0,
      lineCount: 0,
      chararecterCount: 0,
   });

   // content saved
   get contentSaved(): boolean {
      return this.data.contentSaved;
   }
   set contentSaved(value: boolean) {
      this.data.contentSaved = value;
   }

   // character count
   get chararecterCount(): number {
      return this.data.chararecterCount;
   }
   set chararecterCount(value: number) {
      this.data.chararecterCount = value;
   }

   // word count
   get wordCount(): number {
      return this.data.wordCount;
   }
   set wordCount(value: number) {
      this.data.wordCount = value;
   }

   // line count
   get lineCount(): number {
      return this.data.lineCount;
   }
   set lineCount(value: number) {
      this.data.lineCount = value;
   }
}
export let editorStore = $state(new EditorStore());
