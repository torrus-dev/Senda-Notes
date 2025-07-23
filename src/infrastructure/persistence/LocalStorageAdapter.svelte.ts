export abstract class LocalStorageAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private storageKey: string) {}

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
    * Guarda los datos manualmente en localStorage
    * @returns true si el guardado fue exitoso, false en caso contrario
    */
   public save(): boolean {
      try {
         const serializableData = this.serializeData(this.data);
         localStorage.setItem(
            this.storageKey,
            JSON.stringify(serializableData),
         );
         return true;
      } catch (error) {
         console.warn(
            `Error saving ${this.storageKey} to localStorage:`,
            error,
         );
         return false;
      }
   }

   protected load(): void {
      try {
         const storedData = localStorage.getItem(this.storageKey);
         if (storedData) {
            const parsedData = JSON.parse(storedData);
            this.data = this.deserializeData(parsedData);
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

   /**
    * Recarga los datos desde localStorage
    */
   public reload(): void {
      this.load();
   }
}
