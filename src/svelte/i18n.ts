import i18next from "i18next";
import { createI18nStore } from "svelte-i18next";

i18next.init({
   lng: "es", // Cambia a español por defecto ya que usas "es-ES" en Luxon
   fallbackLng: "en",
   debug: true, // Solo en desarrollo
   resources: {
      en: {
         translation: {
            welcome: "Welcome",
            hello: "Hello World",
            settings: "Settings",
            // Añade más claves aquí
         },
      },
      es: {
         translation: {
            welcome: "Bienvenido",
            hello: "Hola Mundo",
            settings: "Configuración",
            // Añade más claves aquí
         },
      },
   },
   interpolation: {
      escapeValue: false,
   },
});

const i18n = createI18nStore(i18next);
export default i18n;
