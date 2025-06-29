export abstract class PersistentLocalStorageModel<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private storageKey: string) {
      this.data = this.getDefaultData();
      this.initializeData();
   }

   private initializeData() {
      this.loadData();
      this.isInitialized = true;

      // Auto-guardar al detectar cambios
      $effect.root(() => {
         $effect(() => {
            if (this.isInitialized) {
               JSON.stringify(this.data);
               this.saveData();
            }
         });
      });
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   private saveData(): void {
      try {
         const serializableData = $state.snapshot(this.data);
         localStorage.setItem(
            this.storageKey,
            JSON.stringify(serializableData),
         );
      } catch (error) {
         console.warn(
            `Error saving ${this.storageKey} to localStorage:`,
            error,
         );
      }
   }

   private loadData(): void {
      try {
         const stored = localStorage.getItem(this.storageKey);
         if (stored) {
            const parsedData = JSON.parse(stored);
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            this.data = { ...this.getDefaultData(), ...parsedData };
         }
      } catch (error) {
         console.warn(
            `Error loading ${this.storageKey} from localStorage:`,
            error,
         );
         this.data = this.getDefaultData();
      }
   }

   // Método público para resetear a valores por defecto
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }
}
