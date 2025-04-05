import { loadSettingsState, saveSettingsState } from "@utils/storage";
import { Settings } from "@projectTypes/settingsTypes";

class SettingsController {
   state = $state<Settings>({
      theme: "dark",
      sidebarIsLocked: false,
      showMetadata: false,
      showEditorToolbar: false,
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
   getLockSidebar = () => this.state.sidebarIsLocked;

   /**
    * @returns {"light" | "dark"} - Returns "light" or "dark" theme.
    * @description Returns the current theme of the application.
    */
   getTheme = (): "light" | "dark" => this.state.theme;

   /**
    * @returns {void}
    * @description Hides or shows the metadata information on notes.
    */
   toggleShowMetadata = (): void => {
      this.state.showMetadata = !this.state.showMetadata;
   };

   /**
    *
    * @returns {boolean} - Returns true if the metadata is shown, false otherwise
    * @description This function is used to get the value of showMetadata from the state.
    * It is used to determine whether the metadata should be shown or not.
    */
   getShowMetadata = (): boolean => this.state.showMetadata;

   // --- EDITOR TOOLBAR ---
   getShowEditorToolbar = (): boolean => this.state.showEditorToolbar;
   toogleShowEditorToolbar = () => {
      this.state.showEditorToolbar = !this.state.showEditorToolbar;
   };
}

export const settingsController = $state(new SettingsController());
