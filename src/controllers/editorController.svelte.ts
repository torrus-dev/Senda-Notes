import type { NoteStats } from "@projectTypes/noteTypes";
import { noteController } from "@controllers/note/noteController.svelte";
import { DateTime } from "luxon";

class EditorController {
   private state = $state({
      contentSaved: true,
      currentStats: {
         wordCount: 0,
         characterCount: 0,
         lineCount: 0,
      },
   });

   set contentSaved(newValue: boolean) {
      this.state.contentSaved = newValue;
   }
   get contentSaved() {
      return this.state.contentSaved;
   }

   // Estadísticas actuales (para UI en tiempo real)
   get wordCount() {
      return this.state.currentStats.wordCount;
   }
   get characterCount() {
      return this.state.currentStats.characterCount;
   }
   get lineCount() {
      return this.state.currentStats.lineCount;
   }

   // Método para actualizar estadísticas
   updateStats(wordCount: number, characterCount: number, lineCount: number) {
      this.state.currentStats = {
         wordCount,
         characterCount,
         lineCount,
      };
   }

   // Método para guardar estadísticas en la nota
   saveStatsToNote(noteId: string) {
      const stats: NoteStats = {
         ...this.state.currentStats,
         lastCalculated: DateTime.now(),
      };

      noteController.updateNoteStats(noteId, stats);
   }

   // Método para resetear estadísticas
   resetStats() {
      this.state.currentStats = {
         wordCount: 0,
         characterCount: 0,
         lineCount: 0,
      };
   }
}

export const editorController = $state(new EditorController());
