import { screenSizeController } from "@controllers/screenSizeController.svelte";
import type { Coordinates, Dimensions } from "@projectTypes/positionTypes";

export function calculateContextMenuCoordinates(
   coordinates: Coordinates,
   menuDimensions: Dimensions,
): Coordinates {
   const windowSize: Dimensions = screenSizeController.getWindowSize();
   const x = Math.min(
      Math.max(coordinates.x, 0),
      windowSize.width - menuDimensions.width,
   );
   const y = Math.min(
      Math.max(coordinates.y, 0),
      windowSize.height - menuDimensions.height,
   );

   return { x, y };
}
