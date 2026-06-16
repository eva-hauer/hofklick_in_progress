/**
 * Creates an inline style string from a map of CSS properties to values.
 * camelCase property names are converted to kebab-case automatically.
 * CSS custom properties (starting with `--`) are kept as-is.
 * Entries with `null`, `undefined`, or empty string values are omitted.
 *
 * @param {Record<string, string | number | null | undefined>} styles - Map of CSS properties to values.
 * @returns {string} Semicolon-separated CSS declaration string for use inside a `style` attribute.
 * @example
 * // camelCase is converted to kebab-case
 * html`<div style="${styleMap({ color: 'red', fontSize: '16px', fontWeight: 700 })}">Text</div>`
 * // → style="color:red;font-size:16px;font-weight:700"
 *
 * // CSS custom properties are kept as-is
 * html`<div style="${styleMap({ '--accent-color': theme, opacity: isHidden ? 0 : 1 })}">...</div>`
 *
 * // Conditional styles: null/undefined values are excluded
 * html`<div style="${styleMap({ display: isVisible ? 'block' : null })}">...</div>`
 */
export function styleMap(styles) {
  return Object.entries(styles)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => {
      const prop = k.startsWith("--") ? k : k.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${prop}:${v}`;
    })
    .join(";");
}
