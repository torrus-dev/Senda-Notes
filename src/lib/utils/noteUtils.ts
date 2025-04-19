import { DateTime } from "luxon";
import { Note, NoteMetadata } from "@projectTypes/noteTypes";

// utils
export function removeDiacritics(text: string): string {
   return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// notes

export function sanitizeTitle(title: string): string {
   return title
      .replace(/[\/]/g, "") // Eliminar barras diagonales "/"
      .replace(/[\n\r]+/g, " ") // Reemplazar saltos de línea por espacios
      .trim() // Eliminar espacios al inicio y final
      .slice(0, 100); // Limitar a 100 caracteres
}

export function generateUniqueTitle(notes: Note[]): string {
   const titleBase = "Nota Nueva";

   const currentTitles = new Set(notes.map((note) => note.title));
   if (!currentTitles.has(titleBase)) return titleBase;
   let index = 1;
   while (currentTitles.has(`${titleBase} ${index}`)) index++;

   return `${titleBase} ${index}`;
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

// -------------------
// Relaciones hijos y padres
// -------------------

export function getDescendantsId(notes: Note[], parentId: string): string[] {
   const parent = notes.find((note) => note.id === parentId);
   if (!parent) return [];

   return parent.children.reduce((acc: string[], childId) => {
      return [...acc, childId, ...getDescendantsId(notes, childId)];
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
