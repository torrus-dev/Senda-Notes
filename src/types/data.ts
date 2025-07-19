import { DateTime } from "luxon";

// Persistencia Core que vive en los modelos, dejando fuera paretes de la UI que mantendre en localStorage / JSON Files
// cada uno en el modelo que le corresponde...
let notes: Note[];
let globalProperties: GlobalProperty[];
let favorites: NoteReference[];

// NOTAS

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

export interface NoteReference {
   noteId: string;
   title: string;
   icon?: string;
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

// PROPIEDADES

interface BaseProperty {
   id: string; // con crypto.randomUUID()
   noteId: Note["id"];
   globalPropertyId?: GlobalProperty["id"];
   name: string;
}

/** Propiedad de texto sencillo */
export interface TextProperty extends BaseProperty {
   type: "text";
   value: string;
}

/** Propiedad de lista de textos */
export interface ListProperty extends BaseProperty {
   type: "list";
   value: string[];
}

/** Propiedad numérica */
export interface NumberProperty extends BaseProperty {
   type: "number";
   value: number;
}

/** Propiedad de casilla (true/false) */
export interface CheckProperty extends BaseProperty {
   type: "check";
   value: boolean;
}

/** Propiedad de fecha (solo fecha) */
export interface DateProperty extends BaseProperty {
   type: "date";
   value: Date;
}

/** Propiedad de fecha y hora */
export interface DateTimeProperty extends BaseProperty {
   type: "datetime";
   value: DateTime;
}

/** Unión de todos los tipos de propiedad */
type NoteProperty =
   | TextProperty
   | ListProperty
   | NumberProperty
   | CheckProperty
   | DateProperty
   | DateTimeProperty;

interface GlobalProperty {
   id: string;
   name: string;
   type: NoteProperty["type"];
   linkedProperties: { noteId: Note["id"]; propertyId: NoteProperty["id"] }[];
   createdAt: DateTime;
   updatedAt: DateTime;
   // Valores posibles para sugerencias, principalmente para valores como text o list
   suggestedValues?: string[]; // para text/list
}
