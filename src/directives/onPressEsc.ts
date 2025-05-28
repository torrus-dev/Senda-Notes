export interface EscOptions {
   action: () => void;
}

export function onPressEsc(
   node: HTMLElement,
   options: EscOptions | (() => void),
) {
   // Normalizar opciones para soportar tanto función directa como objeto
   let normalizedOptions: EscOptions;

   if (typeof options === "function") {
      normalizedOptions = { action: options };
   } else {
      normalizedOptions = options;
   }

   let { action } = normalizedOptions;

   if (typeof action !== "function") {
      console.error("onPressEsc: action must be a function");
      return { destroy() {} };
   }

   // Definir manejador de evento
   const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
         action();
      }
   };

   // Agregar event listener con un pequeño retraso
   const timerId = setTimeout(setupListener, 10);

   // Funciones auxiliares
   function setupListener() {
      document.addEventListener("keydown", handleKeyDown, true);
   }

   function removeListener() {
      document.removeEventListener("keydown", handleKeyDown, true);
   }

   // Retornar API de la directiva "use:" de Svelte
   return {
      update(newOptions: EscOptions | (() => void)) {
         // Normalizar nuevas opciones
         if (typeof newOptions === "function") {
            normalizedOptions = { action: newOptions };
         } else {
            Object.assign(normalizedOptions, newOptions);
         }

         action = normalizedOptions.action;

         // Verificar que action siga siendo válido
         if (typeof action !== "function") {
            console.error("onPressEsc update: action must be a function");
         }
      },

      destroy() {
         clearTimeout(timerId);
         removeListener();
      },
   };
}
