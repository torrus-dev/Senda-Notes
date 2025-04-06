import type { Editor, EditorOptions } from "@tiptap/core";

/**
 * Opciones personalizadas para crear la configuración del editor
 */
interface EditorConfigOptions {
   element: HTMLElement;
   content: string;
   onUpdate: NonNullable<EditorOptions["onUpdate"]>;
}

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

/**
 * Obtiene la posición del cursor en el editor a partir de un evento de mouse
 *
 * @param editor - Instancia del editor
 * @param event - Evento del mouse
 * @returns Posición en el editor o null si no se encuentra
 */
export function getEditorPositionFromEvent(editor: Editor, event: MouseEvent) {
   const { clientX, clientY } = event;
   return editor.view.posAtCoords({ left: clientX, top: clientY });
}
