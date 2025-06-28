import type { UiModeType } from "@projectTypes/ui/uiTypes";

export type AppSettings = {
   uiMode: UiModeType;
   showEditorToolbar: boolean;
   sidebarIsLocked: boolean;
   showMetadata: boolean;
   debugLevel: number;
};
