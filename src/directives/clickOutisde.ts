// src/directives/clickOutside.ts

/**
 * Directiva para detectar clics fuera de un elemento del DOM
 * @param node - El elemento del DOM al que se aplica la directiva
 * @param callback - Función que se ejecuta cuando se detecta un clic fuera del elemento
 */
export function clickOutside(node: HTMLElement, callback: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && event.target !== node) {
      callback();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
    update(newCallback: () => void) {
      callback = newCallback;
    },
  };
}
