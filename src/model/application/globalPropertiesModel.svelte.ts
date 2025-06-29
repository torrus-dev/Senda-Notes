import type { GlobalProperty } from "@projectTypes/core/propertyTypes";
import { PersistentLocalStorageModel } from "@model/persistentLocalStorage.svelte";

interface GlobalPropertiesData {
   globalProperties: GlobalProperty[];
}

class GlobalPropertiesModel extends PersistentLocalStorageModel<GlobalPropertiesData> {
   constructor() {
      super("GlobalProperties");
   }

   protected getDefaultData(): GlobalPropertiesData {
      return {
         globalProperties: [],
      };
   }
   // MÉTODOS PÚBLICOS PARA GLOBAL PROPERTIES

   createGlobalProperty(globalProperty: GlobalProperty): void {
      this.data.globalProperties.push(globalProperty);
   }

   deleteGlobalProperty(id: GlobalProperty["id"]): void {
      this.data.globalProperties = this.data.globalProperties.filter(
         (globalProperty) => globalProperty.id !== id,
      );
   }

   updateGlobalPropertyById(
      id: GlobalProperty["id"],
      updater: (globalProperty: GlobalProperty) => GlobalProperty,
   ): void {
      const index = this.data.globalProperties.findIndex((n) => n.id === id);
      if (index !== -1) {
         this.data.globalProperties[index] = updater(
            this.data.globalProperties[index],
         );
      }
   }
}

export let globalPropertiesModel = $state(new GlobalPropertiesModel());
