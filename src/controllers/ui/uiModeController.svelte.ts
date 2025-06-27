import { uiModeModel } from "@model/ui/uiModeModel.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

class UiModeController {
   showOptions: boolean = $state(false);
   prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

   isDarkMode: boolean = $derived(
      this.uiMode === "dark" || this.prefersDarkColorScheme.matches,
   );

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

   get uiMode() {
      return uiModeModel.settings.uiMode;
   }

   set uiMode(theme) {
      uiModeModel.settings.uiMode = theme;
      this.applyTheme();
   }
}

export let uiModeController = $state(new UiModeController());
