export interface ClickOutsideOptions {
   action: () => void;
   triggerElement?: HTMLElement | null;
}

export function onClickOutside(
   node: HTMLElement,
   options: ClickOutsideOptions | (() => void),
) {
   // Normalizar opciones para soportar tanto función directa como objeto
   let normalizedOptions: ClickOutsideOptions;

   if (typeof options === "function") {
      normalizedOptions = { action: options };
   } else {
      normalizedOptions = options;
   }

   let { action, triggerElement } = normalizedOptions;

   if (typeof action !== "function") {
      console.error("onClickOutside: action must be a function");
      return { destroy() {} };
   }

   // Definir manejador de evento
   const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickInTriggerElement = triggerElement?.contains(target);
      if (clickInTriggerElement) return;

      const clickOutside = !node.contains(target);
      if (clickOutside) {
         action();
         event.preventDefault();
         event.stopPropagation();
      }
   };

   // Agregar event listener con un pequeño retraso
   const timerId = setTimeout(setupListener, 10);

   // Funciones auxiliares
   function setupListener() {
      document.addEventListener("mousedown", handleClickOutside, true);
   }

   function removeListener() {
      document.removeEventListener("mousedown", handleClickOutside, true);
   }

   // Retornar API de la directiva "use:" de Svelte
   return {
      update(newOptions: ClickOutsideOptions | (() => void)) {
         // Normalizar nuevas opciones
         if (typeof newOptions === "function") {
            normalizedOptions = { action: newOptions };
         } else {
            Object.assign(normalizedOptions, newOptions);
         }

         action = normalizedOptions.action;
         triggerElement = normalizedOptions.triggerElement;

         // Verificar que action siga siendo válido
         if (typeof action !== "function") {
            console.error("onClickOutside update: action must be a function");
         }
      },

      destroy() {
         clearTimeout(timerId);
         removeListener();
      },
   };
}
