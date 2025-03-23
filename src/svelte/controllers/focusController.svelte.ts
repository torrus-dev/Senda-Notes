import type { FocusState } from "../types/types";
import { FocusTarget } from "../types/types";

class FocusController {
  focus = $state<FocusState>({
    targetId: null,
    timestamp: 0,
  });

  // Referencias a elementos DOM que pueden recibir enfoque
  private elementsMap = $state(new Map<FocusTarget, HTMLElement | null>());

  constructor() {
    $effect.root(() => {
      $effect(() => {
        const { targetId, timestamp } = this.focus;
        if (targetId && timestamp > 0) {
          this.applyFocus(targetId);
        }
      });
    });
  }

  // Método que aplica el enfoque al elemento
  private applyFocus(targetId: FocusTarget) {
    const element = this.elementsMap.get(targetId);
    if (!element) return;

    setTimeout(() => {
      element.focus();
      this.handleContentEditableElement(element);
    }, 0);
  }

  // Método específico para elementos editables
  private handleContentEditableElement(element: HTMLElement) {
    if (!element.hasAttribute("contenteditable")) return;

    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false); // Colocar al final
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  requestFocus = (targetId: FocusTarget) => {
    console.log("focusing ", targetId);
    this.focus = {
      targetId,
      timestamp: Date.now(),
    };
  };

  clearFocus = () => {
    this.focus = {
      targetId: null,
      timestamp: 0,
    };
  };

  registerElement = (targetId: FocusTarget, element: HTMLElement | null) => {
    this.elementsMap.set(targetId, element);
  };

  unregisterElement = (targetId: FocusTarget) => {
    this.elementsMap.delete(targetId);
  };

  // Nuevo método para seleccionar todo el texto de un elemento
  selectAllText = (targetId: FocusTarget) => {
    const element = this.elementsMap.get(targetId);
    if (!element) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 0);
  };
}

export const focusController = $state(new FocusController());
