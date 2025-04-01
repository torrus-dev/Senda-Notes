import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import type { Placement } from "@floating-ui/dom";

// Define una interfaz para el elemento de referencia
export interface ReferenceElement {
   getBoundingClientRect(): {
      x: number;
      y: number;
      width: number;
      height: number;
      top: number;
      left: number;
      right: number;
      bottom: number;
   };
}

// Función para crear una referencia virtual basada en coordenadas
export function createCoordinateReference(
   x: number,
   y: number,
): ReferenceElement {
   return {
      getBoundingClientRect() {
         return {
            x: x,
            y: y,
            width: 1,
            height: 1,
            top: y,
            left: x,
            right: x + 1,
            bottom: y + 1,
         };
      },
   };
}

// Opciones para el cálculo de posición
export interface PositioningOptions {
   placement?: Placement;
   offsetValue?: number;
   padding?: number;
   fallbackPlacements?: Placement[];
}

// Función principal para calcular la posición
export async function calculateFloatingPosition(
   reference: ReferenceElement,
   floating: HTMLElement,
   options: PositioningOptions = {},
): Promise<{ x: number; y: number }> {
   const {
      placement = "bottom-start",
      offsetValue = 0,
      padding = 5,
      fallbackPlacements = ["top-start"],
   } = options;

   const { x, y } = await computePosition(reference, floating, {
      placement,
      middleware: [
         offset(offsetValue),
         flip({ fallbackPlacements }),
         shift({ padding }),
      ],
   });

   return { x, y };
}
