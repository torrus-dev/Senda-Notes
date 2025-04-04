export interface CloseOptions {
   onClose: () => void;
   closeOnEsc?: boolean;
   closeOnClickOutside?: boolean;
   triggerElement?: HTMLElement;
}

export function onOutsideOrEsc(
   node: HTMLElement,
   options?: CloseOptions | (() => void),
) {
   // Asegurarnos de que options esté definido
   if (!options) {
      console.error("onOutsideOrEsc: options is required");
      return {
         destroy() {},
      };
   }

   // Inicializar config con valores por defecto
   let config: CloseOptions;

   if (typeof options === "function") {
      config = {
         onClose: options,
         closeOnEsc: true,
         closeOnClickOutside: true,
      };
   } else {
      config = {
         onClose: options.onClose,
         closeOnEsc:
            options.closeOnEsc !== undefined ? options.closeOnEsc : true,
         closeOnClickOutside:
            options.closeOnClickOutside !== undefined
               ? options.closeOnClickOutside
               : true,
      };
   }

   // Verificar que onClose sea una función válida
   if (typeof config.onClose !== "function") {
      console.error("onOutsideOrEsc: onClose must be a function", config);
      return {
         destroy() {},
      };
   }

   // Manejadores de eventos
   const handleClickOutside = (event: MouseEvent) => {
      if (
         config.closeOnClickOutside &&
         node &&
         !node.contains(event.target as Node)
      ) {
         config.onClose();
      }
   };

   const handleKeyDown = (event: KeyboardEvent) => {
      if (config.closeOnEsc && event.key === "Escape") {
         config.onClose();
      }
   };

   // Añadir eventos después de un pequeño retraso
   // para evitar que se activen en el mismo ciclo de renderizado
   setTimeout(() => {
      if (config.closeOnClickOutside) {
         document.addEventListener("mousedown", handleClickOutside, true);
      }

      if (config.closeOnEsc) {
         document.addEventListener("keydown", handleKeyDown, true);
      }
   }, 10);

   return {
      update(newOptions: CloseOptions | (() => void)) {
         if (!newOptions) {
            return;
         }

         if (typeof newOptions === "function") {
            config.onClose = newOptions;
         } else {
            // Actualizar solo los valores proporcionados
            if (newOptions.onClose !== undefined) {
               config.onClose = newOptions.onClose;
            }
            if (newOptions.closeOnEsc !== undefined) {
               config.closeOnEsc = newOptions.closeOnEsc;
            }
            if (newOptions.closeOnClickOutside !== undefined) {
               config.closeOnClickOutside = newOptions.closeOnClickOutside;
            }
         }

         // Verificar que onClose siga siendo una función válida
         if (typeof config.onClose !== "function") {
            console.error(
               "onOutsideOrEsc update: onClose must be a function",
               config,
            );
         }
      },
      destroy() {
         if (config.closeOnClickOutside) {
            document.removeEventListener("mousedown", handleClickOutside, true);
         }
         if (config.closeOnEsc) {
            document.removeEventListener("keydown", handleKeyDown, true);
         }
      },
   };
}
