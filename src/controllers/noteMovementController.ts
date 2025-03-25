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
 * Se recorre el array una única vez.
 */
export function removeFromParent(notes: Note[], targetId: string): Note[] {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].children.indexOf(targetId) !== -1) {
      notes[i] = {
        ...notes[i],
        children: notes[i].children.filter((id) => id !== targetId),
      };
    }
  }
  return notes;
}

/**
 * Agrega a targetId como hijo del padre indicado, en la posición deseada (o al final).
 * Se recorre el array una única vez.
 */
export function addToParent(
  notes: Note[],
  parentId: string,
  targetId: string,
  position?: number,
): Note[] {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === parentId) {
      const newChildren = notes[i].children.filter((id) => id !== targetId);
      const pos =
        position !== undefined
          ? Math.min(Math.max(0, position), newChildren.length)
          : newChildren.length;
      newChildren.splice(pos, 0, targetId);
      notes[i] = { ...notes[i], children: newChildren };
      break;
    }
  }
  return notes;
}

/**
 * Reordena una nota manteniendo el mismo padre (o entre raíces).
 * Para raíces, se actualiza in place recogiendo índices y modificando solo las posiciones necesarias.
 */
function reorderWithinSameParent(
  notes: Note[],
  targetId: string,
  parentId: string | undefined,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  if (parentId === undefined) {
    // Recoger índices y IDs de notas raíz en una única pasada.
    const rootIndices: number[] = [];
    const rootIds: string[] = [];
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].parentId === undefined) {
        rootIndices.push(i);
        rootIds.push(notes[i].id);
      }
    }
    const newOrder = reorderIds(rootIds, targetId, newPosition);
    // Actualizamos las notas en las posiciones indicadas según el nuevo orden.
    for (let j = 0; j < rootIndices.length; j++) {
      const idx = rootIndices[j];
      const updatedNote = getNoteById(newOrder[j]);
      if (updatedNote) {
        notes[idx] = updateNote(updatedNote);
      }
    }
    return notes;
  }
  // Caso nota con padre: se reordena la lista de hijos.
  return addToParent(notes, parentId, targetId, newPosition);
}

/**
 * Mueve la nota a raíz o a un nuevo padre.
 * Para raíz, se actualiza parentId a undefined.
 */
function moveToNewParentOrRoot(
  notes: Note[],
  targetId: string,
  newParentId: string | undefined,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  // Elimina targetId de cualquier lista de hijos.
  removeFromParent(notes, targetId);

  if (newParentId === undefined) {
    // Mover a raíz: actualizamos el parentId a undefined.
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].id === targetId) {
        notes[i] = updateNote({ ...notes[i], parentId: undefined });
        break;
      }
    }
    // Reordenamos raíces en una única pasada.
    const rootIndices: number[] = [];
    const rootIds: string[] = [];
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].parentId === undefined) {
        rootIndices.push(i);
        rootIds.push(notes[i].id);
      }
    }
    const newOrder = reorderIds(rootIds, targetId, newPosition);
    for (let j = 0; j < rootIndices.length; j++) {
      const idx = rootIndices[j];
      const updatedNote = getNoteById(newOrder[j]);
      if (updatedNote) {
        notes[idx] = updateNote(updatedNote);
      }
    }
    return notes;
  }

  // Mover a un nuevo padre: actualizamos el parentId y agregamos targetId.
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id === targetId) {
      notes[i] = updateNote({ ...notes[i], parentId: newParentId });
      break;
    }
  }
  return addToParent(notes, newParentId, targetId, newPosition);
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
 * @param newParentId Nuevo padre o undefined para raíz.
 * @param newPosition Posición deseada en el array de hijos (o de raíces).
 * @param getNoteById Función para obtener una nota por su ID.
 * @param updateNote Función para actualizar la nota (ej. refrescar timestamp).
 * @returns Nuevo array de notas con la reestructuración aplicada.
 */
export function moveNoteInTree(
  notes: Note[],
  targetId: string,
  newParentId: string | undefined,
  newPosition: number,
  getNoteById: (id: string) => Note | undefined,
  updateNote: (note: Note) => Note,
): Note[] {
  const note = getNoteById(targetId);
  if (!note) throw new Error(`Note ${targetId} not found`);

  console.log(
    `Moving note "${note.title}" to "${getNoteById(newParentId).title}" at pos ${newPosition}`,
  );

  if (note.parentId === newParentId) {
    // Si el padre se mantiene, se trata de una reordenación.
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
