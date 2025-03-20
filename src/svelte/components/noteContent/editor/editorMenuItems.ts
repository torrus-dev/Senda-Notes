import {
  Bold,
  Italic,
  Heading1Icon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-svelte";
import type { Editor } from "@tiptap/core";
import { MenuItem, SubmenuMenuItem } from "../../../types/contextMenuTypes";
import { Selection } from "@tiptap/pm/state";
import { Node } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

export function getFormatMenuItems(editor: Editor) {
  if (!editor) return [];

  return <MenuItem[]>[
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
    // Submenú de Encabezados
    {
      label: "Encabezado",
      icon: Heading1Icon, // Puedes usar un icono que represente los encabezados
      children: [
        {
          label: "Negrita",
          icon: Bold,
          checked: editor.isActive("bold"),
          onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: "Encabezado 1",
          icon: Heading1Icon,
          checked: editor.isActive("heading", { level: 1 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          label: "Encabezado 2",
          icon: Heading2,
          checked: editor.isActive("heading", { level: 2 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          label: "Encabezado 3",
          icon: Heading3,
          checked: editor.isActive("heading", { level: 3 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ] as MenuItem[], // Especificamos que los hijos son del tipo MenuItem
    } as SubmenuMenuItem,
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
  findWordAt(doc: Node, pos: number) {
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
   * Determina si una posición está dentro de la selección actual
   * @param {Selection} selection - La selección actual
   * @param {number} pos - Posición a verificar
   * @returns {boolean} - true si la posición está dentro de la selección
   */
  isPosInSelection(selection: Selection, pos: number) {
    return pos >= selection.from && pos <= selection.to;
  },

  /**
   * Almacena información sobre la palabra en la posición actual sin seleccionarla visualmente
   * @param {Editor} editor - Instancia del editor
   * @param {number} x - Coordenada x del clic
   * @param {number} y - Coordenada y del clic
   * @returns {Object|null} - Objeto con el rango de la palabra o null si no hay palabra
   */
  storeWordAtPosition(editor: Editor, x: number, y: number) {
    const { view } = editor;
    const { state } = view;

    const pos = view.posAtCoords({ left: x, top: y });
    if (!pos) return null;

    // Mover el cursor a la posición del clic
    view.dispatch(
      state.tr.setSelection(TextSelection.create(state.doc, pos.pos)),
    );

    // Buscar los límites de la palabra actual
    return this.findWordAt(state.doc, pos.pos);
  },

  /**
   * Aplica el formato a la palabra en las coordenadas dadas sin selección visual
   * @param {Editor} editor - Instancia del editor
   * @param {number} x - Coordenada x del clic
   * @param {number} y - Coordenada y del clic
   * @returns {Object|null} - Información sobre la palabra o null
   */
  getContextInfo(editor: Editor, x: number, y: number) {
    const { view } = editor;
    const { state } = view;

    // Verificar si hay texto seleccionado
    const hasSelection = !state.selection.empty;

    // Obtener posición en el documento desde las coordenadas
    const pos = view.posAtCoords({ left: x, top: y });
    if (!pos) return null;

    // Verificar si el clic fue dentro de la selección actual
    const clickedInSelection =
      hasSelection && this.isPosInSelection(state.selection, pos.pos);

    if (hasSelection) {
      // Si ya hay selección y el clic fue fuera de ella
      if (!clickedInSelection) {
        // Cancelar selección y mover cursor
        view.dispatch(
          state.tr.setSelection(TextSelection.create(state.doc, pos.pos)),
        );

        // Buscar palabra en nueva posición
        const wordRange = this.findWordAt(state.doc, pos.pos);

        return {
          hasSelection: false,
          clickedInSelection: false,
          wordRange,
          currentPos: pos.pos,
        };
      }

      // Si el clic fue dentro de la selección, mantener la selección actual
      return {
        hasSelection: true,
        clickedInSelection: true,
        selectionRange: { from: state.selection.from, to: state.selection.to },
        currentPos: pos.pos,
      };
    } else {
      // Si no hay selección, verificar si hay palabra en la posición
      const wordRange = this.findWordAt(state.doc, pos.pos);

      // Mover el cursor a la posición del clic
      view.dispatch(
        state.tr.setSelection(TextSelection.create(state.doc, pos.pos)),
      );

      return {
        hasSelection: false,
        clickedInSelection: false,
        wordRange,
        currentPos: pos.pos,
      };
    }
  },
};
