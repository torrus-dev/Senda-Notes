export abstract class LocalStorageAdapter<T> {
   data: T = $state() as T;
   public isInitialized = $state(false);

   constructor(private storageKey: string) {}

   public initialize() {
      this.initializeData();
   }

   private initializeData() {
      this.loadData();
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

   save(): void {
      try {
         const serializableData = this.serializeData(this.data);
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

   protected loadData(): void {
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
}
