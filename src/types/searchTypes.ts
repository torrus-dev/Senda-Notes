import type { Note } from "./noteTypes";

export interface SearchResult {
   note: Note;
   matchType: "title" | "alias";
   matchedText: string;
   path: string;
}
