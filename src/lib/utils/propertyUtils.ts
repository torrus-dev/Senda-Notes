import {
   TextIcon,
   ListIcon,
   HashIcon,
   CheckSquareIcon,
   CalendarIcon,
   CalendarClockIcon,
} from "lucide-svelte";
import { DateTime } from "luxon";
import { Property } from "@projectTypes/propertyTypes";

// Seleccionar el icono según el tipo de propiedad
export function getIconComponent(type: string) {
   switch (type) {
      case "text":
         return TextIcon;
      case "list":
         return ListIcon;
      case "number":
         return HashIcon;
      case "check":
         return CheckSquareIcon;
      case "date":
         return CalendarIcon;
      case "datetime":
         return CalendarClockIcon;
      default:
         return null;
   }
}

// Definimos una función auxiliar específica para cada tipo de propiedad
export function getDefaultTypeValue(type: Property["type"]): any {
   switch (type) {
      case "text":
         return "";
      case "list":
         return [];
      case "number":
         return 0;
      case "check":
         return false;
      case "date":
         return new Date();
      case "datetime":
         return DateTime.now();
      default:
         const exhaustiveCheck: never = type;
         throw new Error(`Tipo de propiedad no soportado: ${exhaustiveCheck}`);
   }
}
