const handlers = new Map();
let nextId = 0;

/**
 * Create an event listener attribute for an element.
 * @param {string} event - The event name
 * @param {(e: Event) => void} handler - The event handler
 * @returns {string} The event attribute string
 * @example
 * // Add click handler
 * html`<button ${on('click', () => count.set(count.get() + 1))}>Increment</button>`
 *
 * // Handle form submission
 * html`<form ${on('submit', handleSubmit)}>...</form>`
 */
export function on(event, handler) {
  const id = nextId++;
  handlers.set(id, { event, handler });
  return `data-kwm-ev data-kwm-e-${id}="${event}"`;
}

/**
 * Apply event listeners to a DOM tree.
 * @param {HTMLElement} root - The root element to search for events
 */
export function applyEvents(root) {
  for (const el of root.querySelectorAll("[data-kwm-ev]")) {
    el.removeAttribute("data-kwm-ev");

    for (const attr of [...el.attributes]) {
      if (!attr.name.startsWith("data-kwm-e-")) continue;
      const id = Number(attr.name.slice(11));
      const h = handlers.get(id);
      handlers.delete(id);
      if (!h) continue;

      el.addEventListener(h.event, h.handler);
      el.removeAttribute(attr.name);
    }
  }
}
