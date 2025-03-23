import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import katex from "katex";

// Extensión para fórmulas en línea
export const MathInline = Node.create({
  name: "mathInline",

  group: "inline",

  inline: true,

  atom: true,

  content: "text*",

  marks: "",

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "math-inline",
        class: "math-inline",
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("mathInlineRenderer"),
        props: {
          nodeViews: {
            mathInline: (node, view, getPos) => {
              const dom = document.createElement("span");
              dom.setAttribute("data-type", "math-inline");
              dom.classList.add("math-inline");

              try {
                if (node.textContent) {
                  katex.render(node.textContent, dom, {
                    throwOnError: false,
                    displayMode: false,
                  });
                }
              } catch (error) {
                console.error("Error rendering KaTeX:", error);
                dom.textContent = node.textContent;
              }

              // Editar la fórmula al hacer doble clic
              dom.addEventListener("dblclick", () => {
                const formula = node.textContent;
                const newFormula = prompt(
                  "Editar fórmula matemática (sintaxis LaTeX):",
                  formula,
                );

                if (newFormula !== null && newFormula !== formula) {
                  const pos = getPos();
                  const transaction = view.state.tr.setNodeMarkup(
                    pos,
                    undefined,
                    {
                      ...node.attrs,
                    },
                  );

                  // Reemplazar el contenido de texto
                  const textNode = node.content.firstChild;
                  if (textNode) {
                    transaction.replaceWith(
                      pos + 1,
                      pos + 1 + textNode.nodeSize,
                      view.state.schema.text(newFormula),
                    );
                  } else {
                    transaction.insert(
                      pos + 1,
                      view.state.schema.text(newFormula),
                    );
                  }

                  view.dispatch(transaction);
                }
              });

              return {
                dom,
                contentDOM: null,
                update(updatedNode) {
                  if (updatedNode.type.name !== "mathInline") {
                    return false;
                  }

                  try {
                    if (updatedNode.textContent) {
                      katex.render(updatedNode.textContent, dom, {
                        throwOnError: false,
                        displayMode: false,
                      });
                    }
                  } catch (error) {
                    console.error("Error updating KaTeX:", error);
                    dom.textContent = updatedNode.textContent;
                  }

                  return true;
                },
                destroy() {
                  // Limpiar event listeners
                  dom.removeEventListener("dblclick", () => {});
                },
              };
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      insertMathInline:
        (content = "") =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: content ? [{ type: "text", text: content }] : [],
          });
        },
    };
  },
});

// Extensión para fórmulas en bloque
export const MathBlock = Node.create({
  name: "mathBlock",

  group: "block",

  atom: true,

  content: "text*",

  marks: "",

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "math-block",
        class: "math-block",
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("mathBlockRenderer"),
        props: {
          nodeViews: {
            mathBlock: (node, view, getPos) => {
              const dom = document.createElement("div");
              dom.setAttribute("data-type", "math-block");
              dom.classList.add("math-block");

              try {
                if (node.textContent) {
                  katex.render(node.textContent, dom, {
                    throwOnError: false,
                    displayMode: true,
                  });
                }
              } catch (error) {
                console.error("Error rendering KaTeX:", error);
                dom.textContent = node.textContent;
              }

              // Editar la fórmula al hacer doble clic
              dom.addEventListener("dblclick", () => {
                const formula = node.textContent;
                const newFormula = prompt(
                  "Editar fórmula matemática (sintaxis LaTeX):",
                  formula,
                );

                if (newFormula !== null && newFormula !== formula) {
                  const pos = getPos();
                  const transaction = view.state.tr.setNodeMarkup(
                    pos,
                    undefined,
                    {
                      ...node.attrs,
                    },
                  );

                  // Reemplazar el contenido de texto
                  const textNode = node.content.firstChild;
                  if (textNode) {
                    transaction.replaceWith(
                      pos + 1,
                      pos + 1 + textNode.nodeSize,
                      view.state.schema.text(newFormula),
                    );
                  } else {
                    transaction.insert(
                      pos + 1,
                      view.state.schema.text(newFormula),
                    );
                  }

                  view.dispatch(transaction);
                }
              });

              return {
                dom,
                contentDOM: null,
                update(updatedNode) {
                  if (updatedNode.type.name !== "mathBlock") {
                    return false;
                  }

                  try {
                    if (updatedNode.textContent) {
                      katex.render(updatedNode.textContent, dom, {
                        throwOnError: false,
                        displayMode: true,
                      });
                    }
                  } catch (error) {
                    console.error("Error updating KaTeX:", error);
                    dom.textContent = updatedNode.textContent;
                  }

                  return true;
                },
                destroy() {
                  // Limpiar event listeners
                  dom.removeEventListener("dblclick", () => {});
                },
              };
            },
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      insertMathBlock:
        (content = "") =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: content ? [{ type: "text", text: content }] : [],
          });
        },
    };
  },
});

// Exportar ambas extensiones como un objeto
export const MathExtension = {
  MathInline,
  MathBlock,
};

export default MathExtension;
