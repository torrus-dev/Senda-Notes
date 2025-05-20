import {
   TextIcon,
   ListIcon,
   HashIcon,
   CheckSquareIcon,
   CalendarIcon,
   CalendarClockIcon,
   type Icon,
} from "lucide-svelte";
import type { GlobalProperty, NoteProperty } from "@projectTypes/propertyTypes";
import { DateTime } from "luxon";

// Seleccionar el icono según el tipo de propiedad
export function getPropertyIcon(type: string) {
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
         return undefined;
   }
}

// Definimos una función auxiliar específica para cada tipo de propiedad
function getDefaultTypeValue(
   type: NoteProperty["type"],
): NoteProperty["value"] {
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
         throw new Error(`Tipo de propiedad no soportado: ${type}`);
   }
}

export function generateProperty(
   name: NoteProperty["name"],
   type: NoteProperty["type"],
): NoteProperty {
   const newProperty = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      value: getDefaultTypeValue(type),
   };
   return newProperty as NoteProperty;
}

export function getPropertyTypesList(): { value: string; label: string }[] {
   return [
      { value: "text", label: "Text" },
      { value: "list", label: "List" },
      { value: "number", label: "Number" },
      { value: "check", label: "Check" },
      { value: "date", label: "Date" },
      { value: "datetime", label: "Datetime" },
   ];
}

export function convertPropertyValue(
   oldType: NoteProperty["type"],
   newtype: NoteProperty["type"],
) {
   // completar
   return getDefaultTypeValue(newtype);
}

export function generateGlobalProperty(
   name: GlobalProperty["name"],
   type: GlobalProperty["type"],
   property: NoteProperty,
): GlobalProperty {
   const newGlobalProperty: GlobalProperty = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      linkedProperties: [
         {
            noteId: property.noteId,
            propertyId: property.id,
         },
      ],
   };
   return newGlobalProperty;
}
