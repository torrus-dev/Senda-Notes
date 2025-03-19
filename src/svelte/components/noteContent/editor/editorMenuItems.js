import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-svelte";

/**
 * Genera los elementos del menú de formato con su estado actual
 * @param {Editor} editor - Instancia del editor TipTap
 * @returns {Array} - Array de objetos de menú con sus propiedades
 */
export function getFormatMenuItems(editor) {
  if (!editor) return [];

  return [
    {
      label: "Negrita",
      icon: Bold,
      checked: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Cursiva",
      icon: Italic,
      checked: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    { separator: true },
    {
      label: "Encabezado 1",
      icon: Heading1,
      checked: editor.isActive("heading", { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Encabezado 2",
      icon: Heading2,
      checked: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Encabezado 3",
      icon: Heading3,
      checked: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { separator: true },
    {
      label: "Lista de viñetas",
      icon: List,
      checked: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      checked: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    { separator: true },
    {
      label: "Cita",
      icon: Quote,
      checked: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Código",
      icon: Code,
      checked: editor.isActive("codeBlock"),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];
}

/**
 * Funciones de utilidad para manipular el editor
 */
export const editorUtils = {
  /**
   * Encuentra los límites de una palabra en el documento
   * @param {Node} doc - Documento de ProseMirror
   * @param {number} pos - Posición en el documento
   * @returns {Object|null} - Objeto con las posiciones from y to, o null si no hay palabra
   */
  findWordAt(doc, pos) {
    // Resolvemos la posición para obtener información del nodo
    const resolvedPosition = doc.resolve(pos);
    // Los límites del bloque actual
    const blockStart = resolvedPosition.start();
    const blockEnd = resolvedPosition.end();
    // Obtenemos el texto del bloque, insertando un espacio en saltos de nodo
    const blockText = doc.textBetween(blockStart, blockEnd, " ");
    // Calculamos la posición relativa dentro del bloque
    const offset = pos - blockStart;

    // Si en la posición hay un espacio, no hay palabra a seleccionar
    if (/\s/.test(blockText[offset])) return null;

    let start = offset;
    let end = offset;

    // Retrocedemos hasta encontrar un espacio o el inicio del bloque
    while (start > 0 && !/\s/.test(blockText[start - 1])) {
      start--;
    }

    // Avanzamos hasta encontrar un espacio o el final del bloque
    while (end < blockText.length && !/\s/.test(blockText[end])) {
      end++;
    }

    return { from: blockStart + start, to: blockStart + end };
  },

  /**
   * Selecciona la palabra en la posición actual
   * @param {Editor} editor - Instancia del editor
   * @param {number} x - Coordenada x del clic
   * @param {number} y - Coordenada y del clic
   * @returns {boolean} - true si se seleccionó una palabra, false en caso contrario
   */
  selectWordAtPosition(editor, x, y) {
    const { view } = editor;
    const { state } = view;

    // Verificar si hay texto seleccionado
    if (!state.selection.empty) return true;

    const pos = view.posAtCoords({ left: x, top: y });
    if (!pos) return false;

    // Buscar los límites de la palabra actual
    const wordRange = this.findWordAt(state.doc, pos.pos);
    if (!wordRange) return false;

    // Seleccionar la palabra
    const { from, to } = wordRange;
    view.dispatch(
      state.tr.setSelection(
        state.selection.constructor.create(state.doc, from, to),
      ),
    );

    return true;
  },
};
