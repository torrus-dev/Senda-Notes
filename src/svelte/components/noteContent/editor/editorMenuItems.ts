import {
  CopyIcon,
  ScissorsIcon,
  ClipboardPasteIcon,
  PenLineIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  EraserIcon,
  ListOrderedIcon,
  ListIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  TextIcon,
  QuoteIcon,
  SquareCodeIcon,
  MinusIcon,
  PilcrowIcon,
  BetweenHorizontalStartIcon,
  CheckSquareIcon,
  HighlighterIcon,
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
      label: "Formato",
      icon: PenLineIcon,
      children: [
        {
          label: "Negrita",
          icon: BoldIcon,
          checked: editor.isActive("bold"),
          onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: "Cursiva",
          icon: ItalicIcon,
          checked: editor.isActive("italic"),
          onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          label: "Tachado",
          icon: StrikethroughIcon,
          checked: editor.isActive("strike"),
          onClick: () => editor.chain().focus().toggleStrike().run(),
        },
        { separator: true },
        {
          label: "Código en línea",
          icon: CodeIcon,
          checked: editor.isActive("code"),
          onClick: () => editor.chain().focus().toggleCode().run(),
        },
        // Añadimos la opción de texto destacado
        {
          label: "Destacar",
          icon: HighlighterIcon,
          checked: editor.isActive("highlight"),
          onClick: () => editor.chain().focus().toggleHighlight().run(),
        },
        { separator: true },
        {
          label: "Limpiar formato",
          icon: EraserIcon,
          onClick: () =>
            editor.chain().focus().unsetAllMarks().clearNodes().run(),
        },
      ],
    },
    {
      label: "Párrafo",
      icon: PilcrowIcon,
      children: [
        {
          label: "Lista numerada",
          icon: ListOrderedIcon,
          checked: editor.isActive("orderedList"),
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          label: "Lista normal",
          icon: ListIcon,
          checked: editor.isActive("bulletList"),
          onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        // Añadimos la opción de lista de tareas
        {
          label: "Lista de tareas",
          icon: CheckSquareIcon,
          checked: editor.isActive("taskList"),
          onClick: () => editor.chain().focus().toggleTaskList().run(),
        },
        { separator: true },
        {
          label: "Título 1",
          icon: Heading1Icon,
          checked: editor.isActive("heading", { level: 1 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          label: "Título 2",
          icon: Heading2Icon,
          checked: editor.isActive("heading", { level: 2 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          label: "Título 3",
          icon: Heading3Icon,
          checked: editor.isActive("heading", { level: 3 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          label: "Título 4",
          icon: Heading4Icon,
          checked: editor.isActive("heading", { level: 4 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 4 }).run(),
        },
        {
          label: "Título 5",
          icon: Heading5Icon,
          checked: editor.isActive("heading", { level: 5 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 5 }).run(),
        },
        {
          label: "Título 6",
          icon: Heading6Icon,
          checked: editor.isActive("heading", { level: 6 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 6 }).run(),
        },
        {
          label: "Párrafo normal",
          icon: TextIcon,
          checked: editor.isActive("paragraph"),
          onClick: () => editor.chain().focus().setParagraph().run(),
        },
        { separator: true },
        {
          label: "Cita",
          icon: QuoteIcon,
          checked: editor.isActive("blockquote"),
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
      ],
    },
    {
      label: "Insertar",
      icon: BetweenHorizontalStartIcon,
      children: [
        {
          label: "Bloque de código",
          icon: SquareCodeIcon,
          checked: editor.isActive("codeBlock"),
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          label: "Línea horizontal",
          icon: MinusIcon,
          onClick: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
    { separator: true },
    {
      label: "Copiar",
      icon: CopyIcon,
      disabled: editor.state.selection.empty,
      onClick: async () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        await navigator.clipboard.writeText(selectedText);
      },
    },
    {
      label: "Cortar",
      icon: ScissorsIcon,
      disabled: editor.state.selection.empty,
      onClick: async () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        await navigator.clipboard.writeText(selectedText);
        editor.chain().focus().deleteSelection().run();
      },
    },
    {
      label: "Pegar",
      icon: ClipboardPasteIcon,
      onClick: async () => {
        const text = await navigator.clipboard.readText();
        if (text) {
          editor.chain().focus().insertContent(text).run();
        }
      },
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

  /**
   * Función auxiliar para cambiar el estado de un elemento de lista de tareas
   * @param {Editor} editor - Instancia del editor
   * @param {number} index - Índice del elemento de la lista
   * @returns {boolean} - Resultado de la operación
   */
  toggleTaskItemStatus(editor: Editor, index: number) {
    if (!editor) return false;

    let counter = 0;
    let found = false;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "taskItem") {
        if (counter === index) {
          // Cambiar el estado del atributo checked directamente con updateAttributes
          const checked = !node.attrs?.checked;

          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.setNodeMarkup(pos, null, { ...node.attrs, checked });
              return true;
            })
            .run();

          found = true;
          return false; // Detener la búsqueda
        }
        counter++;
      }
      return !found; // Continuar hasta encontrar
    });

    return found;
  },
};
