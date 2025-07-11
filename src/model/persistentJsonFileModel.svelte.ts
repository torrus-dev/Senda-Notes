export abstract class PersistentJsonFileModel<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);
   private saveTimeout: number | null = null;
   private readonly DEBOUNCE_DELAY = 500;

   constructor(
      private filename: string,
      private autoInitialize: boolean = true, // Nuevo parámetro
   ) {
      this.data = this.getDefaultData();

      if (autoInitialize) {
         this.initializeData();
      }
   }

   // Ahora es público para permitir inicialización manual
   public async initializeData() {
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

   // Resto del código permanece igual...
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
            this.data = { ...this.getDefaultData(), ...result.data };
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(`Error al cargar ${this.filename}:`, result.error);
         }
      } catch (error) {
         console.error(`Error al cargar ${this.filename}:`, error);
      }
   }

   public async forceSave(): Promise<void> {
      if (this.saveTimeout) {
         clearTimeout(this.saveTimeout);
         this.saveTimeout = null;
      }
      await this.saveData();
   }

   public async reload(): Promise<void> {
      await this.loadData();
   }

   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }
}
