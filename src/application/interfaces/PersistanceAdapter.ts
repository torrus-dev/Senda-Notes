export interface PersistenceAdapter<T> {
   initialize(): Promise<void>;
   getById?(id: string): Promise<T | undefined>;
   getAll(): Promise<T[]>;
   save(data: T): Promise<boolean>;
   update?(id: string, data: T): Promise<boolean>;
   delete?(id: string): Promise<boolean>;
   saveMany?(data: T[]): Promise<boolean>;
   deleteMany?(ids: string[]): Promise<boolean>;
   replaceAll(data: T): Promise<boolean>;
   isAvailable(): boolean;
   reset?(): Promise<boolean>;
}
