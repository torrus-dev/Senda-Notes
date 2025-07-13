import { settingsController } from "@controllers/application/settingsController.svelte";
import type { UiModeType } from "@projectTypes/ui/uiTypes";

class UiModeController {
   prefersDarkColorScheme = window.matchMedia("(prefers-color-scheme: dark)");

   isDarkMode: boolean = $derived(
      this.uiMode === "dark" ||
         (this.uiMode === "system" && this.prefersDarkColorScheme.matches),
   );

   get uiMode() {
      return settingsController.get("uiMode");
   }

   set uiMode(theme) {
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

   applyThemeToHTMLDocument() {
      const newUiMode = this.checkMode();
      document.documentElement.dataset.uiMode = newUiMode;
   }

   constructor() {
      $effect.root(() => {
         $effect(() => {
            if (settingsController.get("uiMode")) {
               this.applyThemeToHTMLDocument();
            }
         });

         // Effect para cambios en preferencia del sistema
         $effect(() => {
            if (this.uiMode !== "system") return;

            const handleSystemThemeChange = (event: MediaQueryListEvent) => {
               if (this.uiMode === "system") {
                  this.applyThemeToHTMLDocument();
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

let instance: UiModeController | null = null;

export const uiModeController = new Proxy(
   {},
   {
      get(_, prop) {
         if (!instance) instance = new UiModeController();
         const value = instance[prop as keyof UiModeController];
         return typeof value === "function" ? value.bind(instance) : value;
      },
   },
) as UiModeController;
