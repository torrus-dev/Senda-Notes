import {
   TextIcon,
   ListIcon,
   HashIcon,
   CheckSquareIcon,
   CalendarIcon,
   CalendarClockIcon,
} from "lucide-svelte";
import { DateTime } from "luxon";
import { Property } from "@projectTypes/noteTypes";

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

/**
 * Devuelve el valor por defecto según el tipo de propiedad
 * @param type Tipo de la propiedad
 * @returns Valor por defecto para ese tipo
 */
export function getDefaultTypeValue(type: Property["type"]) {
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
         return DateTime.now();
      case "datetime":
         return DateTime.now();
      default:
         return ""; // Valor seguro por defecto
   }
}
