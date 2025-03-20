// keyboardNavigation.js
export function initKeyboardNavigation({ menuElement, contextMenuController, onActiveChange }) {
  let activeIndex = -1;
  function handleKeyDown(event) {
    if (!contextMenuController.isOpen) return;
    const itemElements = Array.from(
      menuElement?.querySelectorAll("li button") || []
    );
    if (!itemElements.length) return;
    
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        activeIndex = (activeIndex + 1) % itemElements.length;
        itemElements[activeIndex]?.focus();
        onActiveChange(activeIndex);
        break;
      case "ArrowUp":
        event.preventDefault();
        activeIndex = (activeIndex - 1 + itemElements.length) % itemElements.length;
        itemElements[activeIndex]?.focus();
        onActiveChange(activeIndex);
        break;
      case "Enter":
        if (activeIndex >= 0) {
          const activeItems = contextMenuController.menuItems.filter(
            item => !item.separator
          );
          if (activeIndex < activeItems.length) {
            const item = activeItems[activeIndex];
            if (item.onClick) item.onClick();
            contextMenuController.close();
          }
        }
        break;
    }
  }
  
  window.addEventListener("keydown", handleKeyDown);
  
  // Devuelve una función para quitar el listener
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}
