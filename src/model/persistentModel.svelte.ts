export abstract class PersistentModel<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);
   private saveTimeout: number | null = null;
   private readonly DEBOUNCE_DELAY = 500; // ms

   constructor(private filename: string) {
      this.data = this.getDefaultData();
      this.initializeData();
   }

   private async initializeData() {
      await this.loadData();
      this.isInitialized = true;

      // Configurar auto-guardado al detectar cambios
      $effect.root(() => {
         $effect(() => {
            if (this.isInitialized) {
               JSON.stringify(this.data);
               this.debouncedSave();
            }
         });
      });
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   private debouncedSave() {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = window.setTimeout(() => {
         this.saveData();
      }, this.DEBOUNCE_DELAY);
   }

   private async saveData() {
      try {
         const serializableData = $state.snapshot(this.data);

         const result = await window.electronAPI.fs.saveUserConfigJson(
            this.filename,
            serializableData,
         );
         if (!result.success) {
            console.error(`Error al guardar ${this.filename}:`, result.error);
         } else {
            console.log(`Guardado archivo ${this.filename}`);
         }
      } catch (error) {
         console.error(`Error al guardar ${this.filename}:`, error);
      }
   }

   private async loadData() {
      try {
         const result = await window.electronAPI.fs.loadUserConfigJson(
            this.filename,
         );
         if (result.success && result.data) {
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            console.log("Resultados de cargar json: ", result.data);
            this.data = { ...this.getDefaultData(), ...result.data };
            console.log("Data: ", this.data);
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(`Error al cargar ${this.filename}:`, result.error);
         }
         // Si el archivo no existe (FILE_NOT_FOUND), se mantienen los valores por defecto
      } catch (error) {
         console.error(`Error al cargar ${this.filename}:`, error);
      }
   }

   // Funciones Publicas Auxiliares
   // Método público para forzar guardado inmediato
   public async forceSave(): Promise<void> {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
         this.saveTimeout = null;
      }
      await this.saveData();
   }

   // Método público para recargar datos
   public async reload(): Promise<void> {
      await this.loadData();
   }

   // Método público para resetear a valores por defecto
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }
}
