interface BaseMenuItem {
   type: "separator" | "group" | "action";
   label: string;
   icon?: any;
   class?: string;
}
export interface SeparatorMenuItem {
   type: "separator";
}
export interface ActionMenuItem extends BaseMenuItem {
   type: "action";
   disabled?: boolean;
   action: () => void;
   checked?: boolean;
   children?: never;
}
export interface GroupMenuItem extends BaseMenuItem {
   type: "group";
   children: MenuItem[];
   action?: never;
   checked?: never;
}
export type MenuItem = ActionMenuItem | GroupMenuItem | SeparatorMenuItem;
