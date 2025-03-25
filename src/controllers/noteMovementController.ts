import type { Note } from "../types/noteTypes";

/**
 * Reordena un array de IDs moviendo targetId a la posición indicada.
 */
function reorderIds(
  ids: string[],
  targetId: string,
  newPosition: number,
): string[] {
  const filtered = ids.filter((id) => id !== targetId);
  const pos = Math.min(Math.max(0, newPosition), filtered.length);
  filtered.splice(pos, 0, targetId);
  return filtered;
}

/**
 * Elimina a targetId de la lista de hijos de todas las notas.
 */
export function removeFromParent(notes: Note[], targetId: string): Note[] {
  return notes.map((note) =>
    note.children.includes(targetId)
      ? { ...note, children: note.children.filter((id) => id !== targetId) }
      : note,
  );
}

/**
 * Agrega a targetId como hijo del padre indicado, en la posición deseada (o al final).
 */
export function addToParent(
  notes: Note[],
  parentId: string,
  targetId: string,
  position?: number,
): Note[] {
  return notes.map((note) => {
    if (note.id === parentId) {
      // Eliminamos duplicados y posicionamos la nota
      const newChildren = note.children.filter((id) => id !== targetId);
      const pos =
        position !== undefined
          ? Math.min(Math.max(0, position), newChildren.length)
          : newChildren.length;
      newChildren.splice(pos, 0, targetId);
      return { ...note, children: newChildren };
    }
    return note;
  });
}

/**
 * Caso: Reordenar una nota manteniendo el mismo padre (o entre raíces).
 */
function reorderWithinSameParent(
  notes: Note[],
  targetId: string,
  parentId: string | null,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  if (parentId === null) {
    // Caso raíces: obtenemos IDs de notas sin padre
    const rootIds = notes.filter((n) => !n.parentId).map((n) => n.id);
    const newOrder = reorderIds(rootIds, targetId, newPosition);
    // Actualizamos las raíces y mantenemos el resto intacto
    const updatedRoots = newOrder
      .map((id) => {
        const n = getNoteById(id);
        return n ? updateNote(n) : null;
      })
      .filter((n): n is Note => n !== null);
    const nonRoots = notes.filter((n) => n.parentId);
    return [...updatedRoots, ...nonRoots];
  }
  // Caso nota con padre: se reordena la lista de hijos
  return addToParent(notes, parentId, targetId, newPosition);
}

/**
 * Caso: Mover la nota a raíz o a un nuevo padre.
 */
function moveToNewParentOrRoot(
  notes: Note[],
  targetId: string,
  newParentId: string | null,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  // Quitamos targetId de cualquier lista de hijos
  let updatedNotes = removeFromParent(notes, targetId);

  if (newParentId === null) {
    // Mover a raíz: actualizamos el parentId a undefined
    updatedNotes = updatedNotes.map((n) =>
      n.id === targetId ? updateNote({ ...n, parentId: undefined }) : n,
    );
    const rootIds = updatedNotes.filter((n) => !n.parentId).map((n) => n.id);
    const newOrder = reorderIds(rootIds, targetId, newPosition);
    const updatedRoots = newOrder
      .map((id) => {
        const n = getNoteById(id);
        return n ? updateNote(n) : null;
      })
      .filter((n): n is Note => n !== null);
    const nonRoots = updatedNotes.filter((n) => n.parentId);
    return [...updatedRoots, ...nonRoots];
  }

  // Mover a un nuevo padre: actualizamos el parentId y agregamos targetId
  updatedNotes = updatedNotes.map((n) =>
    n.id === targetId ? updateNote({ ...n, parentId: newParentId }) : n,
  );
  return addToParent(updatedNotes, newParentId, targetId, newPosition);
}

/**
 * Mueve una nota a una nueva posición dentro de la jerarquía.
 *
 * Se delega en funciones específicas según se trate de:
 * - Reordenar dentro del mismo padre (o entre raíces).
 * - Mover a raíz o a un nuevo padre.
 *
 * @param notes Array actual de notas.
 * @param targetId ID de la nota a mover.
 * @param newParentId Nuevo padre o null para raíz.
 * @param newPosition Posición deseada en el array de hijos (o de raíces).
 * @param getNoteById Función para obtener una nota por su ID.
 * @param updateNote Función para actualizar la nota (ej. refrescar timestamp).
 * @returns Nuevo array de notas con la reestructuración aplicada.
 */
export function moveNoteInTree(
  notes: Note[],
  targetId: string,
  newParentId: string | null,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  const note = getNoteById(targetId);
  if (!note) throw new Error(`Note ${targetId} not found`);

  if (note.parentId === newParentId) {
    // Si el padre se mantiene, se trata de una reordenación.
    console.log("reordenación");
    return reorderWithinSameParent(
      notes,
      targetId,
      newParentId,
      newPosition,
      getNoteById,
      updateNote,
    );
  } else {
    // En otro caso, se mueve a raíz o a un nuevo padre.
    console.log("mover a ", newParentId);
    return moveToNewParentOrRoot(
      notes,
      targetId,
      newParentId,
      newPosition,
      getNoteById,
      updateNote,
    );
  }
}
