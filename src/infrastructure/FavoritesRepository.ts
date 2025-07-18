import { PersistentLocalStorageModel } from "@model/persistentLocalStorageModel.svelte";

interface FavoritesData {
   favorites: string[]; // IDs de notas favoritas
}

/**
 * Repositorio para gestionar favoritos
 * Combina queries y commands por simplicidad
 */
export class FavoritesRepository extends PersistentLocalStorageModel<FavoritesData> {
   constructor() {
      super("Favorites");
   }

   protected getDefaultData(): FavoritesData {
      return { favorites: [] };
   }

   /**
    * Obtiene todos los IDs de favoritos
    */
   getAll(): string[] {
      return [...this.data.favorites];
   }

   /**
    * Obtiene favoritos como Set para búsquedas eficientes
    */
   getAllAsSet(): Set<string> {
      return new Set(this.data.favorites);
   }

   /**
    * Verifica si una nota es favorita
    */
   isFavorite(noteId: string): boolean {
      return this.data.favorites.includes(noteId);
   }

   /**
    * Añade una nota a favoritos
    */
   add(noteId: string): boolean {
      if (!this.isFavorite(noteId)) {
         this.data.favorites.push(noteId);
         return true;
      }
      return false;
   }

   /**
    * Elimina una nota de favoritos
    */
   remove(noteId: string): boolean {
      const index = this.data.favorites.indexOf(noteId);
      if (index !== -1) {
         this.data.favorites.splice(index, 1);
         return true;
      }
      return false;
   }

   /**
    * Toggle favorito
    */
   toggle(noteId: string): boolean {
      if (this.isFavorite(noteId)) {
         this.remove(noteId);
         return false; // Ya no es favorito
      } else {
         this.add(noteId);
         return true; // Ahora es favorito
      }
   }

   /**
    * Elimina múltiples favoritos (útil cuando se eliminan notas)
    */
   removeMany(noteIds: Set<string>): number {
      const initialLength = this.data.favorites.length;
      this.data.favorites = this.data.favorites.filter(
         (id) => !noteIds.has(id),
      );
      return initialLength - this.data.favorites.length; // Retorna cuántos se eliminaron
   }

   /**
    * Reordena favoritos
    */
   reorder(orderedIds: string[]): void {
      // Validar que sean los mismos IDs
      const currentSet = new Set(this.data.favorites);
      const newSet = new Set(orderedIds);

      if (
         currentSet.size === newSet.size &&
         orderedIds.every((id) => currentSet.has(id))
      ) {
         this.data.favorites = orderedIds;
      }
   }

   /**
    * Limpia favoritos que ya no existen
    */
   cleanupInvalid(validNoteIds: Set<string>): number {
      const initialLength = this.data.favorites.length;
      this.data.favorites = this.data.favorites.filter((id) =>
         validNoteIds.has(id),
      );
      return initialLength - this.data.favorites.length;
   }

   /**
    * Cuenta total de favoritos
    */
   count(): number {
      return this.data.favorites.length;
   }

   /**
    * Limpia todos los favoritos
    */
   clear(): void {
      this.data.favorites = [];
   }
}
