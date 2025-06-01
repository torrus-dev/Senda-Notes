const STORAGE_KEY = "collapsible-states";

type CollapsibleStates = {
   [key: string]: boolean;
};

class CollapsibleModal {
   states: CollapsibleStates = $state({});

   constructor() {
      this.loadFromStorage();

      // Auto-guardar cuando cambien los estados
      $effect.root(() => {
         $effect(() => {
            this.saveToStorage();
         });
      });
   }

   private loadFromStorage(): void {
      try {
         const stored = localStorage.getItem(STORAGE_KEY);
         if (stored) {
            this.states = JSON.parse(stored);
         }
      } catch (error) {
         console.warn(
            "Error loading collapsible states from localStorage:",
            error,
         );
         this.states = {};
      }
   }

   private saveToStorage(): void {
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(this.states));
      } catch (error) {
         console.warn(
            "Error saving collapsible states to localStorage:",
            error,
         );
      }
   }
}

export const collapsibleModal = new CollapsibleModal();
