export interface CloseOptions {
   action: () => void;
   preventOnEsc?: boolean;
   preventOnClickOutside?: boolean;
   triggerElement?: HTMLElement;
}
