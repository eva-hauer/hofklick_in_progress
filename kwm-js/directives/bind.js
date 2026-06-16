import { untrack } from "../observable.js";
import { esc } from "../component.js";
import { classMap } from "./classMap.js";
import { styleMap } from "./styleMap.js";

const bindings = new Map();
let nextId = 0;

/**
 * @typedef {Object} BindOptions
 * @property {string} [prop='value'] - The property to bind to
 * @property {string} [event='input'] - The event to trigger updates
 */

/**
 * Serialize a binding value for a given prop.
 * Objects bound to `class` are converted via classMap; objects bound to `style` via styleMap.
 * All other values are coerced to string.
 *
 * @param {string} prop
 * @param {unknown} val
 * @returns {string}
 */
function serializeValue(prop, val) {
  if (prop === "class" && val !== null && typeof val === "object") return classMap(val);
  if (prop === "style" && val !== null && typeof val === "object") return styleMap(val);
  return String(val);
}

function setDomValue(el, prop, val) {
  if (prop === "class") {
    el.className = val;
  } else if (prop === "style") {
    el.style.cssText = val;
  } else if (prop === "html") {
    el.innerHTML = val;
  } else if (prop === "text") {
    el.textContent = val;
  } else {
    el[prop] = val;
  }
}

function getDomValue(el, prop) {
  if (prop === "class") return el.className;
  if (prop === "style") return el.style.cssText;
  if (prop === "html") return el.innerHTML;
  if (prop === "text") return el.textContent;
  return el[prop];
}

/**
 * Create a data binding attribute for an element.
 * When `prop` is `'class'` or `'style'`, the observable may hold either a plain string
 * or an object — objects are automatically serialized via `classMap` / `styleMap`.
 *
 * @template T
 * @param {import('../observable.js').Observable<T>} obs - The observable to bind
 * @param {BindOptions} [opts] - Binding options
 * @returns {string} The binding attribute string
 * @example
 * // Standard value binding
 * html`<input type="text" ${bind(name)} />`
 *
 * // Checkbox
 * html`<input type="checkbox" ${bind(isChecked, { prop: 'checked', event: 'change' })} />`
 *
 * // Reactive classes via classMap
 * const classes = observable({ active: true, disabled: false });
 * html`<div ${bind(classes, { prop: 'class' })}>...</div>`
 *
 * // Reactive styles via styleMap
 * const styles = observable({ color: 'red', fontSize: '16px' });
 * html`<div ${bind(styles, { prop: 'style' })}>...</div>`
 */
export function bind(obs, opts = {}) {
  const prop = opts.prop ?? "value";
  const event = opts.event ?? "input";
  const id = nextId++;
  bindings.set(id, { obs, prop, event });
  let val = null;
  untrack(() => {
    val = esc(serializeValue(prop, obs.get()));
  });
  return `data-kwm-bind="${id}" ${prop}="${val}"`;
}

/**
 * Apply bindings to a DOM tree.
 * @param {HTMLElement} root - The root element to search for bindings
 */
export function applyBindings(root) {
  const unsubs = [];
  for (const el of root.querySelectorAll("[data-kwm-bind]")) {
    const id = Number(el.dataset.kwmBind);
    const b = bindings.get(id);
    bindings.delete(id);
    if (!b) continue;
    unsubs.push(applyBinding(el, b.obs, { prop: b.prop, event: b.event }));
  }
  return unsubs;
}

/**
 * Apply a single binding to an element.
 * @template T
 * @param {HTMLElement} el - The element to bind
 * @param {import('../observable.js').Observable<T>} obs - The observable
 * @param {BindOptions} [opts] - Binding options
 */
export function applyBinding(el, obs, opts = {}) {
  let prop = opts.prop ?? "value";
  const event = opts.event ?? "input";

  const next = serializeValue(prop, obs.get());
  if (getDomValue(el, prop) !== next) {
    setDomValue(el, prop, next);
  }

  el.__kwmBound = { obs, prop };
  el.addEventListener(event, () => {
    el.__kwmBound.obs.set(getDomValue(el, el.__kwmBound.prop));
  });
  return obs.subscribe((rawNext) => {
    const serialized = serializeValue(el.__kwmBound.prop, rawNext);
    if (getDomValue(el, el.__kwmBound.prop) !== serialized) {
      setDomValue(el, el.__kwmBound.prop, serialized);
    }
  });
}
