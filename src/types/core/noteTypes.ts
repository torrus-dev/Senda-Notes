import type { NoteProperty } from "@projectTypes/core/propertyTypes";
import type { DateTime } from "luxon";

export interface NoteReference {
   noteId: string;
   title: string;
   icon?: string;
}

export interface Note {
   id: string;
   icon?: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   stats?: NoteStats;
   metadata: NoteMetadata;
   properties: NoteProperty[];
}

export interface NoteMetadata {
   created: DateTime;
   modified: DateTime;
   outgoingLinks: NoteReference[];
   incomingLinks: NoteReference[];
   aliases: string[];
}

export interface NoteStats {
   wordCount: number;
   characterCount: number;
   lineCount: number;
   lastCalculated: DateTime;
}
