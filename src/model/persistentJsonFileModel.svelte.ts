export abstract class PersistentJsonFileModel<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);
   private saveTimeout: number | null = null;
   private readonly DEBOUNCE_DELAY = 500; // ms
   private initializationPromise: Promise<void> | null = null;

   constructor(private filename: string) {
      this.data = this.getDefaultData();
   }

   // Método público para inicializar desde bootstrap
   public async initialize(): Promise<void> {
      if (this.initializationPromise) {
         return this.initializationPromise;
      }

      this.initializationPromise = this.initializeData();
      return this.initializationPromise;
   }

   private async initializeData(): Promise<void> {
      try {
         console.log(
            `PersistentJsonFileModel: Iniciando carga de ${this.filename}`,
         );

         await this.loadData();
         this.isInitialized = true;

         console.log(
            `PersistentJsonFileModel: ${this.filename} inicializado correctamente`,
         );

         // Configurar auto-guardado al detectar cambios
         $effect.root(() => {
            $effect(() => {
               if (this.isInitialized) {
                  JSON.stringify(this.data);
                  this.debouncedSave();
               }
            });
         });
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error inicializando ${this.filename}:`,
            error,
         );
         this.isInitialized = true; // Marcar como inicializado aunque falle
         throw error;
      }
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

         console.log(`PersistentJsonFileModel: Guardando ${this.filename}...`);
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
         console.log(`PersistentJsonFileModel: Cargando ${this.filename}...`);

         const result = await window.electronAPI.fs.loadUserConfigJson(
            this.filename,
         );

         if (result.success && result.data) {
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            this.data = { ...this.getDefaultData(), ...result.data };
            console.log(
               `PersistentJsonFileModel: Datos cargados para ${this.filename}:`,
               this.data,
            );
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(`Error al cargar ${this.filename}:`, result.error);
         } else {
            console.log(
               `PersistentJsonFileModel: Archivo ${this.filename} no encontrado, usando defaults`,
            );
         }
         // Si el archivo no existe (FILE_NOT_FOUND), se mantienen los valores por defecto
      } catch (error) {
         console.error(`Error al cargar ${this.filename}:`, error);
         throw error;
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
