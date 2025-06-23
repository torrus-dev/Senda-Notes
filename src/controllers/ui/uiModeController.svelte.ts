import { uiModeModel } from "@model/uiModeModel.svelte";

class UiModeController {
   showOptions: boolean = $state(false);
   prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

   applyTheme() {
      let newUiMode = this.uiMode;

      if (newUiMode === "system") {
         // Comprobar que modo esta usando el dispositivo
         newUiMode = this.prefersDarkColorScheme.matches ? "dark" : "light";
      }
      document.documentElement.dataset.uiMode = newUiMode;
   }

   constructor() {
      $effect.root(() => {
         // Effect para escuchar cambios en la preferencia del sistema
         $effect(() => {
            if (uiModeController.uiMode !== "system") return;

            const handleChange = (event: MediaQueryListEvent) => {
               if (uiModeController.uiMode === "system") {
                  const uiMode = event.matches ? "dark" : "light";
                  document.documentElement.dataset.uiMode = uiMode;
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
