export interface Property {
  name: string;
  value: string | string[] | number | boolean | Date;
  type: "text" | "list" | "number" | "check" | "date" | "datetime";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  metadata: Property[];
  properties: Property[];
}