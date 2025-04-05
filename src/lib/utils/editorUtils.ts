import type { Editor, EditorOptions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";

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
 * Crea una configuración para el editor TipTap con valores predeterminados
 *
 * @param options - Opciones requeridas para la configuración
 * @returns Configuración parcial del editor
 */
export function createEditorConfig(
   options: EditorConfigOptions,
): Partial<EditorOptions> {
   return {
      element: options.element,
      extensions: [
         StarterKit,
         TaskList,
         TaskItem.configure({ nested: true }),
         Highlight.configure({ multicolor: false }),
         Underline,
      ],
      content: options.content,
      autofocus: true,
      editable: true,
      injectCSS: false,
      onUpdate: options.onUpdate,
   };
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
