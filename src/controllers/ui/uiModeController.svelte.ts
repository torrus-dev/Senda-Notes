import { settingsModel } from "@model/application/settingsModel.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

class UiModeController {
   prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

   isDarkMode: boolean = $derived(
      this.uiMode === "dark" || this.prefersDarkColorScheme.matches,
   );

   get uiMode() {
      return settingsModel.data.uiMode;
   }

   set uiMode(theme) {
      console.log("actualizando variable uiMode en modelo");
      settingsModel.data.uiMode = theme;
      this.applyTheme();
   }

   private checkMode(): Exclude<UiModeType, "system"> {
      if (this.uiMode === "system") {
         // Comprobar que modo esta usando el dispositivo
         return this.prefersDarkColorScheme.matches ? "dark" : "light";
      } else {
         return this.uiMode as Exclude<UiModeType, "system">;
      }
   }
   applyTheme() {
      let newUiMode = this.checkMode();
      document.documentElement.dataset.uiMode = newUiMode;
   }

   constructor() {
      $effect.root(() => {
         // Effect para escuchar cambios en la preferencia del sistema
         $effect(() => {
            if (uiModeController.uiMode !== "system") return;

            const handleChange = (event: MediaQueryListEvent) => {
               if (uiModeController.uiMode === "system") {
                  this.applyTheme();
               }
            };

            this.prefersDarkColorScheme.addEventListener(
               "change",
               handleChange,
            );

            return () => {
               this.prefersDarkColorScheme.removeEventListener(
                  "change",
                  handleChange,
               );
            };
         });
      });
   }
}

export let uiModeController = $state(new UiModeController());
