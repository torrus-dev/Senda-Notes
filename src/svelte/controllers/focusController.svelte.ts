import type { FocusState } from "../types/types";
import { FocusTarget } from "../types/types";

class FocusController {
  focus = $state<FocusState>({
    targetId: null,
    timestamp: 0,
  });

  requestFocus = (targetId: FocusTarget) => {
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
}

export const focusController = $state(new FocusController());
