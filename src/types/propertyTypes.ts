import type { DateTime } from "luxon";
import type { Note } from "./noteTypes";

interface BaseProperty {
   id: string; // con crypto.randomUUID()
   noteId: Note["id"];
   globalPropertyId: GlobalProperty["id"];
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
export type NoteProperty =
   | TextProperty
   | ListProperty
   | NumberProperty
   | CheckProperty
   | DateProperty
   | DateTimeProperty;

export interface GlobalProperty {
   id: string;
   name: string;
   type: NoteProperty["type"];
   linkedProperties: { noteId: Note["id"]; propertyId: NoteProperty["id"] }[];
   createdAt: DateTime;
   updatedAt: DateTime;
   // Valores posibles si el tipo lo admite (puede usarse para sugerencias/autocompletado)
   suggestedValues?: string[]; // para text/list
}
