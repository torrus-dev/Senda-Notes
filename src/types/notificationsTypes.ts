export type SnackbarType = "base" | "success" | "error" | "info" | "warning";

export interface SnackbarAction {
   label: string;
   onClick: () => void;
}

export interface Notification {
   id: string; // único
   type: SnackbarType;
   message: string;
   duration?: number; // en ms, por defecto 3000 o 5000
   action?: SnackbarAction;
}
