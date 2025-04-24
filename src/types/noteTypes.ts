import type { Property } from "@projectTypes/propertyTypes";
import type { DateTime } from "luxon";

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
   propertiesIDs: Property["id"][];
}

export interface NoteMetadata {
   created: DateTime;
   modified: DateTime;
   outgoingLinks: Reference[];
   incomingLinks: Reference[];
   aliases: string[];
}
