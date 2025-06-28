import type { UiModeType } from "@projectTypes/ui/uiTypes";

export type Settings = {
   uiMode: UiModeType;
   showEditorToolbar: boolean;
   sidebarIsLocked: boolean;
   showMetadata: boolean;
   debugLevel: number;
};
