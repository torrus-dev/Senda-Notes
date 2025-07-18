import { DateTime } from "luxon";
import type { NoteMetadata, NoteReference } from "@projectTypes/core/noteTypes";
import { Note } from "@domain/entities/Note";

export function sanitizeTitle(title: string): string {
   return title
      .replace(/[\/]/g, "") // Eliminar barras diagonales "/"
      .replace(/[\n\r]+/g, " ") // Reemplazar saltos de línea por espacios
      .trim() // Eliminar espacios al inicio y final
      .slice(0, 100); // Limitar a 100 caracteres
}

export function generateUniqueTitle(
   notes: Note[],
   titleBase: string | undefined,
): string {
   const base = titleBase ?? "Nueva Nota";
   const currentTitles = new Set(notes.map((note) => note.title));

   // Si el título base no existe, devolverlo tal como está
   if (!currentTitles.has(base)) return base;

   // Si existe, buscar el siguiente número disponible
   let index = 1;
   while (currentTitles.has(`${base} ${index}`)) index++;

   return `${base} ${index}`;
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

// Note Reference
export function createNoteReference(note: Note): NoteReference {
   return {
      noteId: note.id,
      title: note.title,
      icon: note.icon,
   };
}

// Relaciones hijos y padres

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
