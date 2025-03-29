import { loadSettingsState, saveSettingsState } from "../lib/utils/storage";
import { Settings } from "../types/settingsTypes";

class SettingsController {
   state = $state<Settings>({
      showToolbar: false,
      theme: "dark",
      sidebarIsLocked: false,
   });

   constructor() {
      const loadedState = loadSettingsState();
      if (loadedState) {
         this.state = loadedState;
      }

      $effect.root(() => {
         $effect(() => {
            saveSettingsState(this.state);
         });
      });
   }

   toggleThemeMode = () => {
      this.state = {
         ...this.state,
         theme: this.state.theme === "light" ? "dark" : "light",
      };
   };

   toggleLockSidebar = () => {
      this.state = {
         ...this.state,
         sidebarIsLocked: !this.state.sidebarIsLocked,
      };
   };

   getTheme = () => this.state.theme;
}

export const settingsController = $state(new SettingsController());
