// src/directives/closeOnOutsideOrEsc.ts
export interface CloseOptions {
  /**
   * Función a ejecutar cuando se detecta un clic fuera del elemento o se presiona ESC
   */
  onClose: () => void;
  
  /**
   * Determina si la directiva debe reaccionar a la tecla ESC
   * @default true
   */
  closeOnEsc?: boolean;
  
  /**
   * Determina si la directiva debe reaccionar a clics fuera del elemento
   * @default true
   */
  closeOnClickOutside?: boolean;
}

/**
 * Directiva que ejecuta una acción cuando se hace clic fuera del elemento
 * o se presiona la tecla ESC
 * 
 * @example
 * <div use:closeOnOutsideOrEsc={{ onClose: handleClose }}>Contenido</div>
 */
export function closeOnOutsideOrEsc(node: HTMLElement, options: CloseOptions | (() => void)) {
  let config: CloseOptions;
  
  // Permitir usar la función directamente para compatibilidad con versión anterior
  if (typeof options === 'function') {
    config = {
      onClose: options,
      closeOnEsc: true,
      closeOnClickOutside: true
    };
  } else {
    config = {
      closeOnEsc: true,
      closeOnClickOutside: true,
      ...options
    };
  }
  
  const handleClickOutside = (event: MouseEvent) => {
    if (config.closeOnClickOutside && !node.contains(event.target as Node)) {
      config.onClose();
    }
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (config.closeOnEsc && event.key === 'Escape') {
      config.onClose();
    }
  };
  
  // Usar captura para detectar clics antes que otros listeners
  if (config.closeOnClickOutside) {
    document.addEventListener('click', handleClickOutside, true);
  }
  
  if (config.closeOnEsc) {
    document.addEventListener('keydown', handleKeyDown, true);
  }
  
  return {
    update(newOptions: CloseOptions | (() => void)) {
      // Actualizar opciones si la directiva se actualiza
      if (typeof newOptions === 'function') {
        config.onClose = newOptions;
      } else {
        config = {
          closeOnEsc: true, 
          closeOnClickOutside: true,
          ...newOptions
        };
      }
    },
    destroy() {
      // Limpiar listeners cuando el componente se destruye
      if (config.closeOnClickOutside) {
        document.removeEventListener('click', handleClickOutside, true);
      }
      if (config.closeOnEsc) {
        document.removeEventListener('keydown', handleKeyDown, true);
      }
    }
  };
}