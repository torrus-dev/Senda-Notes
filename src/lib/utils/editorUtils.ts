/**
 * Parsea el contenido del editor para manejar casos especiales
 *
 * @param content - Contenido a parsear
 * @returns Contenido parseado listo para el editor
 */
export function parseEditorContent(content: string): string {
   if (!content) return "";

   try {
      // Si es JSON válido, devolvemos una cadena vacía para evitar
      // mostrar el JSON en bruto (según la lógica original)
      JSON.parse(content);
      return "";
   } catch {
      // Si no es JSON o está vacío, devolvemos el contenido original
      return content;
   }
}
