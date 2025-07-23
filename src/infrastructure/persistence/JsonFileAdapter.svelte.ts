export abstract class JsonFileAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private filename: string) {}

   public initialize() {
      this.initializeData();
   }

   private initializeData() {
      this.load();
      this.isInitialized = true;
   }

   // Método abstracto que deben implementar las clases hijas
   protected abstract getDefaultData(): T;

   // Métodos opcionales para serialización/deserialización personalizada
   protected serializeData(data: T): any {
      return $state.snapshot(data);
   }

   protected deserializeData(data: any): T {
      return { ...this.getDefaultData(), ...data };
   }

   /**
    * Guarda los datos manualmente en archivo JSON
    * @returns true si el guardado fue exitoso, false en caso contrario
    */
   public save(): boolean {
      try {
         const serializableData = this.serializeData(this.data);
         const result = window.electronAPI.fs.writeJson(this.filename, serializableData);
         
         if (!result.success) {
            console.error(`Error al guardar ${this.filename}:`, result.error);
            return false;
         }
         
         console.log(`Guardado archivo ${this.filename}`);
         return true;
      } catch (error) {
         console.error(`Error al guardar ${this.filename}:`, error);
         return false;
      }
   }

   protected load(): void {
      try {
         const result = window.electronAPI.fs.readJson(this.filename);

         if (result.success && result.data) {
            // Combinar datos cargados con valores por defecto para manejar nuevas propiedades
            this.data = this.deserializeData(result.data);
            console.log(`Datos cargados para ${this.filename}:`, this.data);
         } else if (result.error !== "FILE_NOT_FOUND") {
            console.error(`Error al cargar ${this.filename}:`, result.error);
            this.data = this.getDefaultData();
         } else {
            console.warn(`Archivo ${this.filename} no encontrado, usando defaults`);
            this.data = this.getDefaultData();
         }
      } catch (error) {
         console.error(`Error al cargar ${this.filename}:`, error);
         this.data = this.getDefaultData();
      }
   }

   /**
    * Recarga los datos desde el archivo
    */
   public reload(): void {
      this.load();
   }

   /**
    * Método público para resetear a valores por defecto
    */
   public resetToDefaults(): void {
      this.data = this.getDefaultData();
   }

   /**
    * Verifica si el archivo existe
    */
   public fileExists(): boolean {
      return window.electronAPI.fs.fileExists(this.filename);
   }
}