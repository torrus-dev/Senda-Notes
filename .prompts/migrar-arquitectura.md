# Contexto y problema

Estoy desarrollando una aplicación local tipo Notion (árbol de notas jerárquico) utilizando Svelte, Vite y Electron, es un proyecto hobbie en solitario.
Por limitar el scope de los cambios vamos a centrarnos unicamente en la parte de las notas.

Esos son los tipos principales, dejando fuera la UI

```
import { DateTime } from "luxon";
// Persistencia Core que vive en los modelos, dejando fuera partes de la UI que mantendre en localStorage / JSON Files
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
   // Valores posibles para sugerencias, principalmente para valores como text o list
   suggestedValues?: string[]; // para text/list
}
```

Ahora mismo los controladores responden a la UI, tienen toda la lógica, el modelo actúa como un wrapper con unos pocos métodos.
Las vistas son componentes Svelte 5
Mis controladores son:

- NoteController (crud)

```
import { FocusTarget } from "@projectTypes/ui/uiTypes";
import type { Note, NoteStats } from "@projectTypes/core/noteTypes";
import {
   createDefaultMetadata,
   generateUniqueTitle,
   sanitizeTitle,
   updateModifiedMetadata,
} from "@utils/noteUtils";
import { DateTime } from "luxon";
import { focusController } from "@controllers/ui/focusController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { notePathController } from "@controllers/notes/notePathController.svelte";
import { notificationController } from "@controllers/application/notificationController.svelte";
import { globalConfirmationDialog } from "@controllers/menu/confirmationDialogController.svelte";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { NoteModel } from "@model/notes/noteModel.svelte";
/**
 * Controlador principal de notas
 * Se enfoca en operaciones CRUD básicas y coordinación con otros controladores
 */
class NoteController {
   private get noteModel(): NoteModel {
      return startupManager.getModel("noteModel");
   }
   setAllNotes = this.noteModel.setAllNotes.bind(this.noteModel);
   // === FUNCIONES PÚBLICAS DE CREACIÓN ===
   /**
    * Crea notas desde un path jerárquico como "proyecto/backend/auth"
    * Delega la lógica de paths al controlador especializado
    */
   createNoteFromPath = (path: string): string | null => {
      const targetNoteId = notePathController.createNoteFromPath(path);
      if (targetNoteId) {
         this.openAndFocusNote(targetNoteId);
      }
      return targetNoteId;
   };
   createNote = (parentId?: string, noteParts?: Partial<Note>): void => {
      if (parentId && !noteQueryController.validateParentExists(parentId))
         return;
      const noteId = this.createSingleNote(parentId, noteParts);
      if (noteId) {
         this.openAndFocusNote(noteId);
      }
   };
   // === CREACIÓN DE NOTAS ===
   /**
    * Crea una sola nota con los parámetros especificados
    * Método público para ser usado por otros controladores
    */
   createSingleNote(
      parentId?: string,
      noteParts?: Partial<Note>,
   ): string | null {
      try {
         const newNote: Note = this.buildNoteObject(parentId, noteParts);
         this.noteModel.createNote(newNote);
         this.updateParentChildren(parentId, newNote.id);
         return newNote.id;
      } catch (error) {
         console.error("Error creating note:", error);
         return null;
      }
   }
   private buildNoteObject(parentId?: string, noteParts?: Partial<Note>): Note {
      return {
         id: noteParts?.id ?? crypto.randomUUID(),
         title: generateUniqueTitle(
            this.noteModel.getAllNotes(),
            noteParts?.title,
         ),
         children: noteParts?.children ?? [],
         content: noteParts?.content ?? "",
         metadata: noteParts?.metadata ?? createDefaultMetadata(),
         properties: noteParts?.properties ?? [],
         parentId: parentId ?? noteParts?.parentId,
         icon: noteParts?.icon,
         stats: noteParts?.stats,
      };
   }
   private updateParentChildren(
      parentId: string | undefined,
      childId: string,
   ): void {
      if (!parentId) return;
      this.noteModel.updateNote(parentId, (parent) => ({
         ...parent,
         children: [...parent.children, childId],
      }));
   }
   // === FUNCIONES DE ACTUALIZACIÓN ===
   updateNote = (noteId: string, updates: Partial<Note>): void => {
      if (!noteQueryController.getNoteById(noteId)) {
         console.error(`Note with id ${noteId} not found`);
         return;
      }
      this.noteModel.updateNote(noteId, (note) => ({ ...note, ...updates }));
   };
   updateNoteTitle = (noteId: string, title: string): void => {
      const sanitizedTitle = sanitizeTitle(title);
      const note = noteQueryController.getNoteById(noteId);
      if (note && note.title !== sanitizedTitle) {
         this.updateNote(noteId, { title: sanitizedTitle });
      }
   };
   updateNoteIcon = (noteId: string, icon?: string): void => {
      this.updateNote(noteId, { icon });
   };
   updateNoteContent = (noteId: string, content: string): void => {
      this.updateNote(noteId, { content });
   };
   updateNoteStats = (noteId: string, stats: NoteStats): void => {
      this.updateNote(noteId, { stats });
   };
   updateNoteContentWithStats = (
      noteId: string,
      content: string,
      stats: NoteStats,
   ): void => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      this.updateNote(noteId, {
         content,
         stats,
         metadata: {
            ...note.metadata,
            modified: DateTime.now(),
         },
      });
   };
   // === FUNCIONES DE ELIMINACIÓN ===
   deleteNoteWithConfirmation = (id: string): void => {
      const note = noteQueryController.getNoteById(id);
      if (!note) return;
      globalConfirmationDialog.show({
         title: "Borrar Nota",
         message:
            "¿Seguro que quieres borrar esta nota? Esta acción no puede deshacerse.",
         variant: "danger",
         onAccept: () => this.deleteNote(id),
      });
   };
   deleteNote = (id: string): void => {
      const noteToDelete = noteQueryController.getNoteById(id);
      if (!noteToDelete) return;
      // Obtener todos los IDs a eliminar (nota + descendientes)
      const idsToDelete = noteQueryController.getDescendantIds(id);
      idsToDelete.add(id);
      // Batch update: eliminar notas y limpiar referencias en una sola operación
      this.noteModel.updateAllNotes((notes) => {
         // Filtrar notas eliminadas
         const remainingNotes = notes.filter(
            (note) => !idsToDelete.has(note.id),
         );
         // Limpiar referencias en children arrays
         return remainingNotes.map((note) => {
            const hasDeletedChildren = note.children.some((childId) =>
               idsToDelete.has(childId),
            );
            return hasDeletedChildren
               ? updateModifiedMetadata({
                    ...note,
                    children: note.children.filter(
                       (childId) => !idsToDelete.has(childId),
                    ),
                 })
               : note;
         });
      });
      // Limpiar nota activa si fue eliminada
      const activeNoteId = workspaceController.activeNoteId;
      if (activeNoteId && idsToDelete.has(activeNoteId)) {
         workspaceController.closeTabByTabId(activeNoteId);
      }
      notificationController.addNotification({
         message: `Nota "${noteToDelete.title}" eliminada.`,
         type: "base",
      });
   };
   // === FUNCIONES AUXILIARES ===
   private openAndFocusNote(noteId: string): void {
      workspaceController.openNote(noteId);
      focusController.requestFocus(FocusTarget.TITLE);
   }
}
let instance: NoteController | null = null;
export const noteController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new NoteController();
         const value = instance[prop as keyof NoteController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as NoteController;
```

- NoteQueryController (consultas)

```
import type { Note } from "@projectTypes/core/noteTypes";
import { getDescendantsId } from "@utils/noteUtils";
import { workspaceController } from "@controllers/navigation/workspaceController.svelte";
import { normalizeText } from "@utils/searchUtils";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import { NoteModel } from "@model/notes/noteModel.svelte";
// Tipos para resolución de paths
interface PathResolution {
   existingNotes: Note[];
   missingSegments: string[];
   lastParentId?: string;
}
class NoteQueryController {
   private get noteModel(): NoteModel {
      return startupManager.getModel("noteModel");
   }
   getNoteById = this.noteModel.getNoteById.bind(this.noteModel);
   getAllNotes = this.noteModel.getAllNotes.bind(this.noteModel);
   // === MÉTODOS BÁSICOS ===
   getRootNotes() {
      return this.noteModel.getAllNotes().filter((note) => !note.parentId);
   }
   getNotesByIdList(idList: string[]): Note[] {
      return idList
         .map(this.getNoteById)
         .filter((note): note is Note => note !== undefined);
   }
   getActiveNote(): Note | undefined {
      const activeNoteId = workspaceController.activeNoteId;
      return activeNoteId ? this.getNoteById(activeNoteId) : undefined;
   }
   // === MÉTODOS DE PATH ===
   getNotePathAsArray(noteId: string): Array<{ id: string; title: string }> {
      const path: Array<{ id: string; title: string }> = [];
      let currentNote = this.getNoteById(noteId);
      while (currentNote) {
         path.unshift({ id: currentNote.id, title: currentNote.title });
         currentNote = currentNote.parentId
            ? this.getNoteById(currentNote.parentId)
            : undefined;
      }
      return path;
   }
   getNotePathAsString(noteId: string): string {
      return this.getNotePathAsArray(noteId)
         .map((p) => p.title)
         .join("/");
   }
   // === MÉTODOS DE BÚSQUEDA ===
   /**
    * Busca una nota por título exacto y padre específico
    */
   findNoteByTitleAndParent(title: string, parentId?: string): Note | null {
      const normalizedTitle = normalizeText(title);
      return (
         this.getAllNotes().find((note) => {
            const matchesParent = (note.parentId || undefined) === parentId;
            const matchesTitle = normalizeText(note.title) === normalizedTitle;
            return matchesParent && matchesTitle;
         }) || null
      );
   }
   /**
    * Resuelve un path jerárquico y determina qué notas existen y cuáles faltan
    */
   resolveNotePath(pathSegments: string[]): PathResolution {
      const resolution: PathResolution = {
         existingNotes: [],
         missingSegments: [],
         lastParentId: undefined,
      };
      let currentParentId: string | undefined;
      for (const segment of pathSegments) {
         const existingNote = this.findNoteByTitleAndParent(
            segment,
            currentParentId,
         );
         if (existingNote) {
            resolution.existingNotes.push(existingNote);
            currentParentId = existingNote.id;
         } else {
            // Primer segmento faltante - guardar resto y salir
            const currentIndex = resolution.existingNotes.length;
            resolution.missingSegments = pathSegments.slice(currentIndex);
            resolution.lastParentId = currentParentId;
            break;
         }
      }
      return resolution;
   }
   // === MÉTODOS DE ESTADÍSTICAS ===
   getNoteCount(): number {
      return this.getAllNotes().length;
   }
   getChildrenCount(noteId: string): number {
      const note = this.getNoteById(noteId);
      return note ? getDescendantsId(this.getAllNotes(), noteId).length : 0;
   }
   // === MÉTODOS DE DESCENDIENTES ===
   /**
    * Obtiene todos los IDs descendientes (directos e indirectos) de una nota (excluyendo la nota misma)
    */
   getDescendantIds(noteId: string): Set<string> {
      const descendants = new Set<string>();
      const allNotes = this.getAllNotes();
      const collectDescendants = (currNoteId: string) => {
         allNotes.forEach((note) => {
            if (note.parentId === currNoteId) {
               descendants.add(note.id);
               collectDescendants(note.id);
            }
         });
      };
      collectDescendants(noteId);
      return descendants;
   }
   getDirectDescendantsId(noteId: string): Set<Note["id"]> {
      const descendants = new Set<Note["id"]>();
      this.getAllNotes().forEach((note) => {
         if (note.parentId === noteId) {
            descendants.add(note.id);
         }
      });
      return descendants;
   }
   getDirectDescendants(noteId: string): Note[] {
      const descendants: Note[] = [];
      this.getAllNotes().forEach((note) => {
         if (note.parentId === noteId) {
            descendants.push(note);
         }
      });
      return descendants;
   }
   // === MÉTODOS DE VALIDACIÓN ===
   requireNote(id: string, context = "Note"): Note {
      const note = this.getNoteById(id);
      if (!note) throw new Error(`${context} ${id} not found`);
      return note;
   }
   validateParentExists(parentId: string): boolean {
      if (!this.getNoteById(parentId)) {
         console.error(`Parent note with id ${parentId} not found`);
         return false;
      }
      return true;
   }
}
let instance: NoteQueryController | null = null;
export const noteQueryController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new NoteQueryController();
         const value = instance[prop as keyof NoteQueryController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as NoteQueryController;
```

- NotePathController (rutas en la jerarquía)

```
import { sanitizeTitle } from "@utils/noteUtils";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { noteController } from "@controllers/notes/noteController.svelte";
/**
 * Controlador especializado en la lógica de paths jerárquicos
 * Maneja la resolución y creación de notas desde paths como "proyecto/backend/auth"
 */
class NotePathController {
   /**
    * Crea notas desde un path jerárquico como "proyecto/backend/auth"
    */
   createNoteFromPath = (path: string): string | null => {
      try {
         const segments = this.parseNotePath(path);
         if (!segments.length) return null;
         const resolution = noteQueryController.resolveNotePath(segments);
         const targetNoteId = this.executeNoteCreation(resolution);
         return targetNoteId;
      } catch (error) {
         console.error("Error creating note from path:", error);
         return null;
      }
   };
   /**
    * Parsea un path en segmentos válidos
    */
   private parseNotePath(path: string): string[] {
      if (!path?.trim()) return [];
      return path
         .split("/")
         .map((segment) => sanitizeTitle(segment.trim()))
         .filter(Boolean);
   }
   /**
    * Ejecuta la creación de notas faltantes basándose en la resolución del path
    */
   private executeNoteCreation(resolution: any): string | null {
      if (!resolution.missingSegments.length) {
         // Todas las notas existen - retornar la última
         return (
            resolution.existingNotes[resolution.existingNotes.length - 1]?.id ||
            null
         );
      }
      return this.createMissingNotes(resolution);
   }
   /**
    * Crea todas las notas faltantes en secuencia
    */
   private createMissingNotes(resolution: any): string | null {
      let currentParentId = resolution.lastParentId;
      let lastCreatedId: string | null = null;
      for (const segment of resolution.missingSegments) {
         const noteId = noteController.createSingleNote(currentParentId, {
            title: segment,
         });
         if (!noteId) {
            console.error(`Failed to create note: ${segment}`);
            break;
         }
         lastCreatedId = noteId;
         currentParentId = noteId;
      }
      return lastCreatedId;
   }
}
export const notePathController = new NotePathController();
```

- NoteTreeController (operaciones en el árbol de notas)

```
import type { Note } from "@projectTypes/core/noteTypes";
import { noteController } from "@controllers/notes/noteController.svelte";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { generateUniqueTitle } from "@lib/utils/noteUtils";
/**
 * Controlador especializado en operaciones del árbol jerárquico
 * Se enfoca en movimientos, reordenamiento y validaciones de estructura
 */
class NoteTreeController {
   /**
    * Mueve una nota a una nueva posición en el árbol
    */
   moveNoteToPosition = (
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void => {
      const note = noteQueryController.requireNote(noteId);
      // Validaciones previas
      if (newParentId) {
         this.validateParentRelationship(newParentId, noteId);
      }
      // 1. Eliminar referencia del padre anterior
      this.removeFromPreviousParent(note);
      // 2. Actualizar parentId de la nota
      noteController.updateNote(noteId, { parentId: newParentId });
      // 3. Insertar en nueva ubicación
      if (newParentId) {
         this.insertIntoParent(newParentId, noteId, position);
      } else {
         this.insertIntoRoot(noteId, position);
      }
   };
   // === MÉTODOS DE VALIDACIÓN ===
   validateParentRelationship(newParentId: string, noteId: string): void {
      noteQueryController.requireNote(newParentId, "New parent note");
      if (newParentId === noteId) {
         throw new Error("Cannot move note to itself");
      }
      if (this.wouldCreateCycle(newParentId, noteId)) {
         throw new Error("Cannot move note to its own descendant");
      }
   }
   /**
    * Verifica si mover una nota crearía un ciclo
    */
   wouldCreateCycle(parentId: string, childId: string): boolean {
      let current = noteQueryController.getNoteById(parentId);
      while (current?.parentId) {
         if (current.parentId === childId) return true;
         current = noteQueryController.getNoteById(current.parentId);
      }
      return false;
   }
   // === MÉTODOS DE MANIPULACIÓN DEL ÁRBOL ===
   removeFromPreviousParent(note: Note): void {
      if (note.parentId) {
         const parent = noteQueryController.requireNote(note.parentId);
         const updatedParentChildren = parent.children.filter(
            (id) => id !== note.id,
         );
         noteController.updateNote(note.parentId, {
            children: updatedParentChildren,
         });
      }
   }
   insertIntoParent(parentId: string, noteId: string, position: number): void {
      const parentNote: Note = noteQueryController.requireNote(parentId);
      const childrenIds: Note["id"][] = [...parentNote.children];
      // Filtrar el noteId si ya existe
      const filtered = childrenIds.filter((id) => id !== noteId);
      const originalIndex = childrenIds.indexOf(noteId);
      // Validar y actualizar título si es necesario
      const noteToMove = noteQueryController.requireNote(noteId);
      const siblingNotes = noteQueryController.getDirectDescendants(parentId);
      /*.filter((note) => note.id !== noteId); // Excluir la nota que se está moviendo*/
      const uniqueTitle = generateUniqueTitle(siblingNotes, noteToMove.title);
      // Actualizar el título si cambió
      if (uniqueTitle !== noteToMove.title) {
         noteController.updateNote(noteId, { title: uniqueTitle });
      }
      // Calcular posición ajustada usando la lógica original
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         filtered.length,
      );
      // Insertar en la posición correcta
      const newChildren = [
         ...filtered.slice(0, adjustedPosition),
         noteId,
         ...filtered.slice(adjustedPosition),
      ];
      noteController.updateNote(parentId, { children: newChildren });
   }
   insertIntoRoot(noteId: string, position: number): void {
      const allNotes = noteQueryController.getAllNotes();
      const rootNotes = allNotes.filter((note) => !note.parentId);
      const notesWithParents = allNotes.filter((note) => note.parentId);
      // Filtrar la nota movida de rootNotes
      const filteredRootNotes = rootNotes.filter((note) => note.id !== noteId);
      const movedNote = noteQueryController.requireNote(noteId);
      // Validar y actualizar título si es necesario
      const uniqueTitle = generateUniqueTitle(rootNotes, movedNote.title);
      // Actualizar el título si cambió
      if (uniqueTitle !== movedNote.title) {
         noteController.updateNote(noteId, { title: uniqueTitle });
      }
      const updatedNote = noteQueryController.requireNote(noteId);
      // Calcular posición original y ajustada
      const originalIndex = rootNotes.findIndex((note) => note.id === noteId);
      const adjustedPosition = this.getAdjustedPosition(
         originalIndex,
         position,
         filteredRootNotes.length,
      );
      // Crear nuevo array de root notes con la nota en la posición correcta
      const newRootNotes = [
         ...filteredRootNotes.slice(0, adjustedPosition),
         updatedNote,
         ...filteredRootNotes.slice(adjustedPosition),
      ];
      // Actualizar el array completo manteniendo el orden: root notes + notes with parents
      const newNotesOrder = [...newRootNotes, ...notesWithParents];
      noteController.setAllNotes(newNotesOrder);
   }
   /**
    * Calcula la posición ajustada considerando si el elemento ya existe en el array
    * Lógica original preservada del código base
    */
   getAdjustedPosition(
      originalIndex: number,
      targetPosition: number,
      maxLength: number,
   ): number {
      let adjusted = targetPosition;
      // Si el elemento ya existía y está antes de la posición objetivo, ajustar
      if (originalIndex !== -1 && originalIndex < targetPosition) {
         adjusted = targetPosition - 1;
      }
      // Clamping para mantener dentro de límites válidos
      return Math.max(0, Math.min(adjusted, maxLength));
   }
}
export const noteTreeController = new NoteTreeController();
```

- NotePropertyController

```
import type { NoteProperty } from "@projectTypes/core/propertyTypes";
import type { Note } from "@projectTypes/core/noteTypes";
import { noteQueryController } from "@controllers/notes/noteQueryController.svelte";
import { globalPropertyController } from "@controllers/property/globalPropertyController.svelte";
import { noteController } from "@controllers/notes/noteController.svelte";
import { generateProperty } from "@utils/propertyUtils";
import { normalizeText } from "@utils/searchUtils";
class NotePropertyController {
   private addPropertyToNote = (
      noteId: Note["id"],
      newProperty: NoteProperty,
   ) => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      const updatedProperties = [...note.properties, newProperty];
      noteController.updateNote(noteId, { properties: updatedProperties });
   };
   /** Devuelve true si ya existe en la nota otra propiedad con ese nombre */
   isDuplicateName(
      noteId: Note["id"],
      name: string,
      excludePropertyId?: NoteProperty["id"],
   ): boolean {
      const props = this.getNoteProperties(noteId);
      const normalized = normalizeText(name.trim());
      return props
         .filter((p) => p.id !== excludePropertyId)
         .some((p) => normalizeText(p.name.trim()) === normalized);
   }
   handleCreateNoteProperty = (
      noteId: string,
      name: NoteProperty["name"],
      type: NoteProperty["type"],
   ): void => {
      if (this.isDuplicateName(noteId, name)) {
         console.warn(
            `No se puede crear: la nota ${noteId} ya tiene una propiedad "${name}".`,
         );
         return;
      }
      // Generamos la nueva propiedad
      const newProperty = generateProperty(noteId, name, type);
      // Agregamos la nueva propiedad a la nota
      this.addPropertyToNote(noteId, newProperty);
      // Importante: si no hacemos lo de arriba primero, la nota no "existira" y fallara la vinculación
      // Comprobamos si existe propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(name);
      if (existingGlobalProperty) {
         // Vinculamos a la propiedad global si existe
         globalPropertyController.linkToGlobalProperty(
            newProperty,
            existingGlobalProperty,
         );
      } else {
         // Creamos la propiedad global si no existe
         globalPropertyController.createGlobalProperty(name, type, newProperty);
      }
   };
   deletePropertyFromNote = (
      noteId: Note["id"],
      propertyToDeleteId: NoteProperty["id"],
   ) => {
      const propertyToDelete = this.getPropertyById(noteId, propertyToDeleteId);
      if (!propertyToDelete) return;
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      const updatedNoteProperties = note.properties.filter(
         (property) => property.id !== propertyToDeleteId,
      );
      noteController.updateNote(noteId, { properties: updatedNoteProperties });
      // Comprobamos si hay una propiedad global con ese nombre y la desvinculamos
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(
            propertyToDelete.name,
         );
      if (!existingGlobalProperty) return;
      globalPropertyController.unlinkFromGlobalProperty(propertyToDelete);
   };
   updatePropertyFromNote = (
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      updatedProperty: Partial<NoteProperty>,
   ): void => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      const updatedProperties: NoteProperty[] = note.properties.map((prop) => {
         if (prop.id === propertyId) {
            return {
               ...prop,
               ...updatedProperty,
            } as NoteProperty;
         }
         return prop;
      });
      noteController.updateNote(noteId, { properties: updatedProperties });
   };
   getPropertyById = (
      noteId: string,
      propertyId: string,
   ): NoteProperty | undefined => {
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return undefined;
      return note.properties.find((property) => property.id === propertyId);
   };
   renameNotePropertyById(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;
      propertyToUpdate.name = newPropertyName;
      this.updatePropertyFromNote(noteId, propertyId, propertyToUpdate);
   }
   handleNotePropertyRename(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyName: NoteProperty["name"],
   ) {
      if (this.isDuplicateName(noteId, newPropertyName, propertyId)) {
         console.warn(
            `No se puede renombrar: la nota ${noteId} ya tiene una propiedad "${newPropertyName}".`,
         );
         return;
      }
      // Buscamos que exista una propiedad por esos Ids y la renombramos
      const propertyToUpdate = this.getPropertyById(noteId, propertyId);
      if (!propertyToUpdate) return;
      this.renameNotePropertyById(noteId, propertyId, newPropertyName);
      // Comprobamos si existe propiedad global con el nuevo nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(newPropertyName);
      if (existingGlobalProperty) {
         // Si existe propiedad global se vincula a la propiedad
         globalPropertyController.linkToGlobalProperty(
            propertyToUpdate,
            existingGlobalProperty,
         );
      } else {
         // Si no existe propiedad global, la creamos con nombre y tipo
         globalPropertyController.createGlobalProperty(
            newPropertyName,
            propertyToUpdate.type,
            propertyToUpdate,
         );
      }
   }
   changeNotePropertyType(
      noteId: Note["id"],
      propertyId: NoteProperty["id"],
      newPropertyType: NoteProperty["type"],
   ) {
      const property = this.getPropertyById(noteId, propertyId);
      if (!property) return;
      // Comprobamos si hay una propiedad global con ese nombre
      const existingGlobalProperty =
         globalPropertyController.getGlobalPropertyByName(property.name);
      if (!existingGlobalProperty) return;
      // Actualizamos la propiedad
      this.updatePropertyFromNote(noteId, propertyId, {
         type: newPropertyType,
      });
      // Cambiamos el tipo de la propiedad global
      globalPropertyController.updateGlobalPropertyType(
         existingGlobalProperty.id,
         newPropertyType,
      );
   }
   reorderNoteProperties = (
      noteId: string,
      propertyId: string,
      newPosition: number,
   ): void => {
      // Verificamos que la propiedad exista
      const note = noteQueryController.getNoteById(noteId);
      if (!note) return;
      const properties = [...note.properties];
      const currentIndex = properties.findIndex((p) => p.id === propertyId);
      // Validar que la nueva posición no sea negativa
      if (newPosition < 0) {
         throw new Error(
            `Invalid position: ${newPosition}. Must be greater than or equal to 0`,
         );
      }
      // Si la posición es mayor que la longitud, colocar al final
      if (newPosition >= properties.length) {
         newPosition = properties.length - 1;
      }
      // No hacer nada si la posición es la misma
      if (currentIndex === newPosition) {
         return;
      }
      // Extraer la propiedad que se va a mover
      const [propertyToMove] = properties.splice(currentIndex, 1);
      // Insertar la propiedad en la nueva posición
      properties.splice(newPosition, 0, propertyToMove);
      noteController.updateNote(noteId, { properties: properties });
   };
   updateNotePropertyValue = (
      noteId: string,
      propertyId: string,
      newValue: NoteProperty["value"],
   ): void => {
      this.updatePropertyFromNote(noteId, propertyId, { value: newValue });
   };
   getNoteProperties = (noteId: string): NoteProperty[] => {
      const note = noteQueryController.getNoteById(noteId);
      return note ? note.properties : [];
   };
}
export const notePropertyController = $state(new NotePropertyController());
```

Mi modelo para notas es NoteModel

```
import type { Note } from "@projectTypes/core/noteTypes";
import { updateModifiedMetadata } from "@utils/noteUtils";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";
import { DateTime } from "luxon";
interface NoteData {
   notes: Note[];
}
export class NoteModel extends PersistentLocalStorageModel<NoteData> {
   constructor() {
      super("notes");
   }
   protected getDefaultData(): NoteData {
      return { notes: [] };
   }
   // Override de deserialización para manejar DateTime
   protected deserializeData(data: any): NoteData {
      if (!data.notes || !Array.isArray(data.notes)) {
         return { notes: [] };
      }
      return {
         notes: data.notes.map((note: any) => ({
            ...note,
            metadata: {
               ...note.metadata,
               created:
                  typeof note.metadata.created === "string"
                     ? DateTime.fromISO(note.metadata.created)
                     : note.metadata.created,
               modified:
                  typeof note.metadata.modified === "string"
                     ? DateTime.fromISO(note.metadata.modified)
                     : note.metadata.modified,
            },
         })),
      };
   }
   // get/set
   getNoteById(id: string): Note | undefined {
      return this.data.notes.find((note) => note.id === id);
   }
   getAllNotes(): Note[] {
      return this.data.notes;
   }
   setAllNotes(newNotes: Note[]) {
      this.data.notes = newNotes;
   }
   // crud
   createNote(note: Note): void {
      this.data.notes = [...this.data.notes, note];
   }
   updateNote(id: string, updater: (note: Note) => Note): void {
      const index = this.data.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.data.notes[index] = updateModifiedMetadata(
            updater(this.data.notes[index]),
         );
      }
   }
   updateAllNotes(updater: (notes: Note[]) => Note[]): void {
      this.data.notes = updater(this.data.notes);
   }
   deleteNote(id: string): void {
      this.data.notes = this.data.notes.filter((note) => note.id !== id);
   }
}
```

Para los modelos tengo creadas PersistentLocalStorageModel y PersistentJsonFileModel que son clases abstractas que estandarizan el guardado.
Necesito introducir cambios en la arquitectura actual de mi proyecto ya que hay partes hechas de cuando no tenia mucha idea que están mal diseñadas. Ha resultado en controladores que lo hacen todo y Models que actúan como wrappers de los datos (anemic models)
He estado aprendiendo sobre DDD pero me parece muy complejo así que con ayude de Claude hemos diseñado una arquitectura ligera que mejore la actual siendo algo que yo entienda y no añadiendo complejidad innecesaria.
Nueva arquitectura:

# Arquitectura para Aplicación Notion-like (Svelte + Electron)

## Context

Aplicación local tipo Notion con árbol de notas jerárquico. Migración desde controladores que lo hacen todo + modelos anémicos hacia una arquitectura ligera basada en DDD.

## Estructura Final Optimizada

```
src/
├── domain/
│   ├── Note.ts                    # Entidad rica con lógica de negocio
│   ├── NotePathService.ts         # Lógica de paths jerárquicos
│   └── NoteTreeService.ts         # Lógica de árbol y movimientos
├── application/
│   └── NoteUseCases.ts            # Operaciones complejas multi-entidad
├── infrastructure/
│   ├── NoteRepository.ts          # Commands (crear, actualizar, eliminar)
│   └── NoteQueryRepository.ts     # Queries (consultas, búsquedas)
└── controllers/
    ├── NoteController.ts          # Coordinación UI + casos de uso
    └── NoteQueryController.ts     # Coordinación queries + UI
```

## Responsabilidades por Archivo

### **domain/Note.ts**

- Entidad rica con métodos de negocio (`updateTitle`, `addChild`, `canMoveTo`)
- Validaciones de dominio
- Lógica que pertenece específicamente a una nota

### **domain/NotePathService.ts**

- Crear notas desde paths jerárquicos ("proyecto/backend/auth")
- Parsear y resolver paths
- Lógica de creación de notas faltantes en secuencia

### **domain/NoteTreeService.ts**

- Validaciones de movimiento (prevenir ciclos)
- Reordenamiento de notas en el árbol
- Lógica de posicionamiento y jerarquía

### **application/NoteUseCases.ts**

- Operaciones que involucran múltiples entidades/repositorios
- Orquestación de servicios de dominio
- Lógica de aplicación (logging, eventos, transacciones)

### **infrastructure/NoteRepository.ts**

- Comandos que modifican estado (create, update, delete)
- Hereda de `PersistentLocalStorageModel`
- Operaciones de persistencia

### **infrastructure/NoteQueryRepository.ts**

- Consultas que no modifican estado
- Búsquedas, filtros, validaciones de existencia
- Optimizaciones de lectura

### **controllers/NoteController.ts**

- Coordinación entre UI y casos de uso
- Manejo de focus, navegación, notificaciones
- Delegación a `NoteUseCases`

### **controllers/NoteQueryController.ts**

- Coordinación entre UI y queries
- Exposición de consultas a la UI
- Delegación a `NoteQueryRepository`

## Principios Clave

- **Entidades ricas** en lugar de interfaces anémicas
- **Servicios de dominio** solo para lógica compleja
- **Separación Query/Command** para claridad
- **Casos de uso** para operaciones multi-entidad
- **Controladores delgados** que coordinan

## Tipos Principales Actuales

```typescript
interface Note {
   id: string;
   title: string;
   content: string;
   children: string[];
   parentId?: string;
   metadata: NoteMetadata;
   properties: NoteProperty[];
   icon?: string;
   stats?: NoteStats;
}
```

## Migración

1. Convertir `interface Note` a `class Note` con métodos
2. Mover lógica de controladores a servicios de dominio
3. Crear casos de uso para operaciones complejas
4. Separar queries de commands en repositorios
5. Adelgazar controladores para solo coordinación UI
   > >

# Plan de Migración en 4 Pasos

Quiero que me ayudes a implementar este nuevo sistema / arquitectura que te he pasado ahora que ya tienes contexto de los archivos y demás.

## **Paso 1: Entidad Rica Note**

- Convertir `interface Note` a `class Note` con métodos de negocio
- Mover validaciones y lógica básica desde controladores a la entidad
- Métodos: `updateTitle()`, `addChild()`, `removeChild()`, `canMoveTo()`, `isRoot()`

## **Paso 2: Servicios de Dominio**

- Crear `NotePathService` (lógica de paths jerárquicos del actual NotePathController)
- Crear `NoteTreeService` (validaciones y movimientos del actual NoteTreeController)
- Extraer lógica compleja de controladores hacia estos servicios

## **Paso 3: Repositorios Query/Command**

- Refactorizar `NoteModel` → `NoteRepository` (commands: create, update, delete)
- Crear `NoteQueryRepository` (queries: find, search, validate)
- Separar claramente operaciones de lectura vs escritura

## **Paso 4: Casos de Uso y Controladores Delgados**

- Crear `NoteUseCases` para operaciones multi-entidad
- Adelgazar controladores actuales para solo coordinación UI
- Conectar todo: Controller → UseCase → Service/Repository

# Tu respuesta

En tu siguiente respuesta ejecuta solamente el paso 1

Importante! Estamos en desarrollo y se pueden romper cosas sin preocupación. No hay que preocuparse de migrar datos, ni hace falta que sea compatible con el sitema actual, al final pasaremos todo a esta nueva arquitectura. En tu prompt centrate en la tarea y no te excedas ni crees cosas de mas, vale? centrate solo en lo que te he pedido
