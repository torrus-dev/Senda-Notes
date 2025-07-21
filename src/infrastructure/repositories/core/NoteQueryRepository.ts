import { Note } from "@domain/entities/Note";
import { NoteRepository } from "./NoteRepository";
import { normalizeText } from "@utils/searchUtils";

/**
 * Repositorio para queries (operaciones de solo lectura)
 */
export class NoteQueryRepository {
   constructor(private noteRepository: NoteRepository) {}

   /**
    * Obtiene todas las notas como entidades ricas
    */
   findAll(): Note[] {
      return this.noteRepository
         .getAllPlainObjects()
         .map((data) => Note.fromPlainObject(data));
   }

   /**
    * Busca una nota por ID
    */
   findById(noteId: string): Note | undefined {
      const noteData = this.noteRepository
         .getAllPlainObjects()
         .find((n) => n.id === noteId);

      return noteData ? Note.fromPlainObject(noteData) : undefined;
   }

   /**
    * Busca múltiples notas por IDs
    */
   findByIds(noteIds: string[]): Note[] {
      const idSet = new Set(noteIds);
      return this.noteRepository
         .getAllPlainObjects()
         .filter((n) => idSet.has(n.id))
         .map((data) => Note.fromPlainObject(data));
   }

   /**
    * Encuentra notas por título (búsqueda parcial)
    */
   findByTitle(title: string): Note[] {
      const normalizedSearch = normalizeText(title);
      return this.findAll().filter((note) =>
         normalizeText(note.title).includes(normalizedSearch),
      );
   }

   /**
    * Encuentra notas por padre
    */
   findByParent(parentId: string | undefined): Note[] {
      return this.findAll().filter((note) => note.parentId === parentId);
   }

   /**
    * Encuentra las notas raíz
    */
   findRootNotes(): Note[] {
      return this.findAll().filter((note) => !note.parentId);
   }

   /**
    * Verifica si existe una nota
    */
   exists(noteId: string): boolean {
      return this.noteRepository
         .getAllPlainObjects()
         .some((n) => n.id === noteId);
   }

   /**
    * Verifica si un título ya existe en un contexto dado
    */
   titleExists(title: string, parentId?: string, excludeId?: string): boolean {
      const normalizedTitle = normalizeText(title);
      return this.findAll().some(
         (note) =>
            note.id !== excludeId &&
            note.parentId === parentId &&
            normalizeText(note.title) === normalizedTitle,
      );
   }

   /**
    * Cuenta el total de notas
    */
   count(): number {
      return this.noteRepository.getAllPlainObjects().length;
   }

   /**
    * Busca notas que contengan un texto en el contenido
    */
   searchByContent(searchText: string): Note[] {
      const normalizedSearch = normalizeText(searchText);
      return this.findAll().filter((note) =>
         normalizeText(note.content).includes(normalizedSearch),
      );
   }

   /**
    * Busca notas por propiedad
    */
   findByProperty(propertyName: string, propertyValue?: any): Note[] {
      return this.findAll().filter((note) =>
         note.properties.some((prop) => {
            const nameMatches = prop.name === propertyName;
            const valueMatches =
               propertyValue === undefined || prop.value === propertyValue;
            return nameMatches && valueMatches;
         }),
      );
   }

   /**
    * Obtiene notas con estadísticas
    */
   findWithStats(): Note[] {
      return this.findAll().filter((note) => note.stats !== undefined);
   }

   /**
    * Busca notas modificadas después de una fecha
    */
   findModifiedAfter(date: Date): Note[] {
      return this.findAll().filter(
         (note) => note.metadata.modified.toJSDate() > date,
      );
   }

   /**
    * Obtiene notas favoritas (si se pasa una lista de IDs)
    */
   findFavorites(favoriteIds: Set<string>): Note[] {
      return this.findAll().filter((note) => favoriteIds.has(note.id));
   }

   /**
    * Valida si un conjunto de IDs existe
    */
   validateIds(noteIds: string[]): { valid: string[]; invalid: string[] } {
      const existingIds = new Set(
         this.noteRepository.getAllPlainObjects().map((n) => n.id),
      );

      const valid: string[] = [];
      const invalid: string[] = [];

      noteIds.forEach((id) => {
         if (existingIds.has(id)) {
            valid.push(id);
         } else {
            invalid.push(id);
         }
      });

      return { valid, invalid };
   }
}
