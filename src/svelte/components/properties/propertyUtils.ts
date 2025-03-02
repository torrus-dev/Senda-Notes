import {
  TextIcon,
  ListIcon,
  HashIcon,
  CheckSquareIcon,
  CalendarIcon,
  CalendarClockIcon,
} from "lucide-svelte";

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
