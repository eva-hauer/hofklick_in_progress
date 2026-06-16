/**
 * Creates a class attribute value from a map of class names to conditions.
 * Keys with truthy values are included; falsy values are omitted.
 *
 * @param {Record<string, unknown>} classes - Map of class names to boolean conditions.
 * @returns {string} Space-separated class string for use inside a `class` attribute.
 * @example
 * // Static conditions
 * html`<div class="${classMap({ btn: true, 'btn-primary': isPrimary, disabled: !isEnabled })}">Click</div>`
 *
 * // With observable state
 * html`<li class="${classMap({ active: this.selected.get() === item.id })}">Item</li>`
 */
export function classMap(classes) {
  return Object.entries(classes)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .join(" ");
}
