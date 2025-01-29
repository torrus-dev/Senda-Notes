import type { Component } from "svelte";
import type { Property } from "./notes";

declare module "*.svelte" {
  export class PropertyComponent extends Component<{
    property: Property;
    onUpdatePropertyValue: (name: string, value: Property["value"]) => void;
    handlePropertySelection?: (property: Property) => void;
    readonly?: boolean;
    isEditable?: boolean;
  }> { }
}