import { Note } from "@domain/entities/Note";
import { NotePathService } from "@domain/services/NotePathService";
import { NoteTreeService } from "@domain/services/NoteTreeService";
import { NoteRepository } from "@infrastructure/repositories/core/NoteRepository";
import { NoteQueryRepository } from "@infrastructure/repositories/core/NoteQueryRepository";
import { FavoritesUseCases } from "@application/usecases/FavoritesUseCases";
import { generateUniqueTitle } from "@utils/noteUtils";

/**
 * Casos de uso para operaciones complejas con notas
 */
export class NoteUseCases {
   private pathService: NotePathService;
   private treeService: NoteTreeService;
   private favoritesUseCases?: FavoritesUseCases;

   constructor(
      private noteRepository: NoteRepository,
      private queryRepository: NoteQueryRepository,
      favoritesUseCases?: FavoritesUseCases,
   ) {
      this.pathService = new NotePathService();
      this.treeService = new NoteTreeService();
      this.favoritesUseCases = favoritesUseCases;
   }

   /**
    * Crea una nota con validaciones y actualización del padre
    */
   createNote(params: {
      parentId?: string;
      title?: string;
      content?: string;
      icon?: string;
   }): string | null {
      // Validar padre si existe
      if (params.parentId && !this.queryRepository.exists(params.parentId)) {
         console.error(`Parent note ${params.parentId} not found`);
         return null;
      }

      // Generar título único
      const allNotes = this.queryRepository.findAll();
      const finalTitle = generateUniqueTitle(allNotes, params.title);

      // Crear nota
      const newNote = Note.create({
         title: finalTitle,
         parentId: params.parentId,
         content: params.content,
         icon: params.icon,
      });

      // Persistir
      this.noteRepository.create(newNote);

      // Actualizar padre si existe
      if (params.parentId) {
         const parent = this.queryRepository.findById(params.parentId);
         if (parent) {
            parent.addChild(newNote.id);
            this.noteRepository.update(parent.id, parent);
         }
      }

      return newNote.id;
   }

   /**
    * Crea notas desde un path jerárquico
    */
   createNoteFromPath(path: string): string | null {
      const segments = this.pathService.parseNotePath(path);
      if (!segments.length) return null;

      const allNotes = this.queryRepository.findAll();
      const resolution = this.pathService.resolveNotePath(segments, allNotes);

      // Si no hay segmentos faltantes, retornar la última nota existente
      if (!resolution.missingSegments.length) {
         const lastNote =
            resolution.existingNotes[resolution.existingNotes.length - 1];
         return lastNote?.id || null;
      }

      // Crear notas faltantes
      let currentParentId = resolution.lastParentId;
      let lastCreatedId: string | null = null;

      for (const segment of resolution.missingSegments) {
         const noteId = this.createNote({
            parentId: currentParentId,
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

   /**
    * Elimina una nota y todos sus descendientes
    */
   deleteNote(noteId: string): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      const allNotes = this.queryRepository.findAll();

      // Obtener todos los IDs a eliminar
      const descendants = this.treeService.getDescendants(noteId, allNotes);
      const idsToDelete = new Set([noteId, ...descendants.map((n) => n.id)]);

      // Eliminar de padres
      if (note.parentId) {
         const parent = this.queryRepository.findById(note.parentId);
         if (parent) {
            parent.removeChild(noteId);
            this.noteRepository.update(parent.id, parent);
         }
      }

      // Eliminar notas
      this.noteRepository.deleteMany(idsToDelete);

      // Limpiar favoritos
      if (this.favoritesUseCases) {
         this.favoritesUseCases.handleNotesDeleted(idsToDelete);
      }
   }

   /**
    * Mueve una nota a una nueva posición
    */
   moveNote(
      noteId: string,
      newParentId: string | undefined,
      position: number,
   ): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      const allNotes = this.queryRepository.findAll();

      // Validar movimiento
      if (newParentId) {
         const validation = this.treeService.canMoveNote(
            noteId,
            newParentId,
            allNotes,
         );
         if (!validation.valid) {
            throw new Error(validation.reason);
         }
      }

      // Remover del padre anterior
      if (note.parentId) {
         const oldParent = this.queryRepository.findById(note.parentId);
         if (oldParent) {
            oldParent.removeChild(noteId);
            this.noteRepository.update(oldParent.id, oldParent);
         }
      }

      // Actualizar parentId
      note.changeParent(newParentId);

      // Generar título único si es necesario
      const siblings = this.queryRepository.findByParent(newParentId);
      const uniqueTitle = this.treeService.ensureUniqueSiblingTitle(
         note.title,
         newParentId,
         allNotes,
         noteId,
      );

      if (uniqueTitle !== note.title) {
         note.updateTitle(uniqueTitle);
      }

      // Insertar en nueva posición
      if (newParentId) {
         const newParent = this.queryRepository.findById(newParentId);
         if (newParent) {
            newParent.insertChildAt(noteId, position);
            this.noteRepository.update(newParent.id, newParent);
         }
      } else {
         // Mover a raíz - reordenar el array completo
         this.reorderRootNotes(noteId, position);
      }

      // Guardar nota actualizada
      this.noteRepository.update(noteId, note);
   }

   /**
    * Reordena las notas raíz
    */
   private reorderRootNotes(noteId: string, position: number): void {
      const allNotes = this.queryRepository.findAll();
      const rootNotes = this.treeService.getRootNotes(allNotes);
      const otherNotes = allNotes.filter((n) => n.parentId);

      // Filtrar la nota movida
      const filteredRoots = rootNotes.filter((n) => n.id !== noteId);
      const movedNote = allNotes.find((n) => n.id === noteId);

      if (!movedNote) return;

      // Calcular posición ajustada
      const originalIndex = rootNotes.findIndex((n) => n.id === noteId);
      const adjustedPosition = this.treeService.calculateAdjustedPosition(
         originalIndex,
         position,
         filteredRoots.length,
      );

      // Crear nuevo orden
      const newRootOrder = [
         ...filteredRoots.slice(0, adjustedPosition),
         movedNote,
         ...filteredRoots.slice(adjustedPosition),
      ];

      // Actualizar repositorio con nuevo orden
      this.noteRepository.replaceAll([...newRootOrder, ...otherNotes]);
   }

   /**
    * Actualiza el contenido y estadísticas de una nota
    */
   updateNoteContent(noteId: string, content: string, stats?: any): void {
      const note = this.queryRepository.findById(noteId);
      if (!note) return;

      if (stats) {
         note.updateContentWithStats(content, stats);
      } else {
         note.updateContent(content);
      }

      this.noteRepository.update(noteId, note);
   }
}
