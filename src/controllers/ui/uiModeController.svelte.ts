import { settingsController } from "@controllers/application/SettingsController.svelte";
import { startupManager } from "@infrastructure/startup/startupManager.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

class UiModeController {
   private prefersDarkColorScheme = window.matchMedia(
      "(prefers-color-scheme: dark)",
   );

   configuredMode: UiModeType = $derived(
      startupManager.isReady ? settingsController.get("uiMode") : "system",
   );

   isDarkMode: boolean = $derived(
      this.configuredMode === "dark" ||
         (this.configuredMode === "system" &&
            this.prefersDarkColorScheme.matches),
   );

   constructor() {
      // al instanciarlo aplicamos el tema que sera "system" para evitar dar un flash al usuario
      this.applyThemeToHTMLDocument();

      $effect.root(() => {
         $effect(() => {
            // Hacer que el effect sea reactivo al valor de uiMode
            if (startupManager.isReady && this.configuredMode) {
               this.applyThemeToHTMLDocument();
            }
         });

         // Effect para cambios en preferencia del sistema cuando el valor es "system"
         $effect(() => {
            if (this.configuredMode === "system") {
               const handleSystemThemeChange = (event: MediaQueryListEvent) => {
                  this.applyThemeToHTMLDocument();
               };

               this.prefersDarkColorScheme.addEventListener(
                  "change",
                  handleSystemThemeChange,
               );

               return () => {
                  this.prefersDarkColorScheme.removeEventListener(
                     "change",
                     handleSystemThemeChange,
                  );
               };
            }
         });
      });
   }

   applyThemeToHTMLDocument() {
      let newUiMode: Exclude<UiModeType, "system">;
      if (this.configuredMode === "system") {
         newUiMode = this.prefersDarkColorScheme.matches ? "dark" : "light";
      } else {
         newUiMode = this.configuredMode;
      }
      document.documentElement.dataset.uiMode = newUiMode;
   }
}

export let uiModeController = $state(new UiModeController());
