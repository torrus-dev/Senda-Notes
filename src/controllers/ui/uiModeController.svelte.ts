import { settingsController } from "@controllers/application/settingsController.svelte";
import { settingsModel } from "@model/application/settingsModel.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

class UiModeController {
   prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

   isDarkMode: boolean = $derived(
      this.uiMode === "dark" ||
         (this.uiMode === "system" && this.prefersDarkColorScheme.matches),
   );

   get uiMode() {
      return settingsModel.data.uiMode;
   }

   set uiMode(theme) {
      console.log("actualizando variable uiMode en modelo");
      settingsController.set("uiMode", theme);
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
      const newUiMode = this.checkMode();
      document.documentElement.dataset.uiMode = newUiMode;
   }

   constructor() {
      $effect.root(() => {
         // Aplica el tema cuando settingsModel está listo y reacciona a cambios posteriores
         $effect(() => {
            if (!settingsModel.isInitialized) return;

            // Track uiMode para reactividad
            settingsModel.data.uiMode;
            this.applyTheme();
         });

         // Effect para cambios en preferencia del sistema
         $effect(() => {
            if (!settingsModel.isInitialized || this.uiMode !== "system")
               return;

            const handleSystemThemeChange = (event: MediaQueryListEvent) => {
               if (this.uiMode === "system") {
                  this.applyTheme();
               }
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
         });
      });
   }
}

export const uiModeController = $state(new UiModeController());
