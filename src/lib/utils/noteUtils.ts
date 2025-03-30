import { DateTime } from "luxon";
import { Note, NoteMetadata } from "@projectTypes/noteTypes";

export function sanitizeTitle(title: string): string {
   return title
      .replace(/[\n\r]+/g, " ")
      .trim()
      .slice(0, 100);
}

export function updateModifiedMetadata(note: Note): Note {
   return {
      ...note,
      metadata: {
         ...note.metadata,
         modified: DateTime.now(),
      },
   };
}

export function createDefaultMetadata(): NoteMetadata {
   return {
      created: DateTime.now(),
      modified: DateTime.now(),
      outgoingLinks: [],
      incomingLinks: [],
      aliases: [],
   };
}

export function generateUniqueTitle(notes: Note[]): string {
   const titleBase = "Nota Nueva";

   const currentTitles = new Set(notes.map((note) => note.title));
   if (!currentTitles.has(titleBase)) return titleBase;
   let index = 1;
   while (currentTitles.has(`${titleBase} ${index}`)) index++;

   return `${titleBase} ${index}`;
}

// -------------------
// Relaciones hijos y padres
// -------------------

export function getDescendants(notes: Note[], parentId: string): string[] {
   const parent = notes.find((note) => note.id === parentId);
   if (!parent) return [];

   return parent.children.reduce((acc: string[], childId) => {
      return [...acc, childId, ...getDescendants(notes, childId)];
   }, []);
}

export function isDescendant(
   notes: Note[],
   descendantId: string,
   ancestorId: string,
): boolean {
   const descendant = notes.find((note) => note.id === descendantId);
   if (!descendant) return false;

   if (descendant.parentId === ancestorId) return true;
   if (!descendant.parentId) return false;

   // Se comprueba recursivamente si el padre es descendiente
   return isDescendant(notes, descendant.parentId, ancestorId);
}
