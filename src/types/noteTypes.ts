import type { DateTime } from "luxon";

export interface Property {
  id: string;
  name: string;
  value: string | string[] | number | boolean | Date | DateTime;
  type: "text" | "list" | "number" | "check" | "date" | "datetime";
}

export interface Reference {
  id: string;
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
  metadata: NoteMetadata;
  properties: Property[];
}

export interface NoteMetadata {
  created: DateTime;
  modified: DateTime;
  outgoingLinks: Reference[];
  incomingLinks: Reference[];
  aliases: string[];
}
