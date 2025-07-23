export abstract class JsonFileAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);
   private saveTimeout: number | null = null;
   private readonly DEBOUNCE_DELAY = 500; // ms
   private initializationPromise: Promise<void> | null = null;

   constructor(private filename: string) {}

   public async initialize(): Promise<void> {
      if (this.initializationPromise) {
         return this.initializationPromise;
      }

      this.initializationPromise = this.initializeData();
      return this.initializationPromise;
   }

   private async initializeData(): Promise<void> {
      try {
         await this.loadData();
         this.isInitialized = true;
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error inicializando ${this.filename}:`,
            error,
         );
         this.data = this.getDefaultData();
         this.isInitialized = true; // Marcar como inicializado aunque falle
         throw error;
      }
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   private async save() {
      try {
         const serializableData = $state.snapshot(this.data);
         const result = await window.electronAPI.fs.saveUserConfigJson(
            this.filename,
            serializableData,
         );
         if (!result.success) {
            console.error(
               `PersistentJsonFileModel: Error al guardar ${this.filename}:`,
               result.error,
            );
         } else {
            console.log(
               `PersistentJsonFileModel: Guardado archivo ${this.filename}`,
            );
         }
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error al guardar ${this.filename}:`,
            error,
         );
      }
   }

   private async loadData() {
      try {
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
            console.error(
               `PersistentJsonFileModel: Error al cargar ${this.filename}:`,
               result.error,
            );
         } else {
            console.warn(
               `PersistentJsonFileModel: Archivo ${this.filename} no encontrado, usando defaults`,
            );
         }
         // Si el archivo no existe (FILE_NOT_FOUND), se mantienen los valores por defecto
      } catch (error) {
         console.error(
            `PersistentJsonFileModel: Error al cargar ${this.filename}:`,
            error,
         );
         throw error;
      }
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
