'use strict';

/**
 * HTML template literal for KWM-JS.
 *
 * Simply concatenates strings and values.
 *
 * @param {TemplateStringsArray} strings - The template strings
 * @param {...any} values - The interpolated values
 * @returns {string} The constructed HTML string
 *
 * @example
 * const name = "World";
 * const template = html`<div>Hello ${name}!</div>`;
 * // Returns: "<div>Hello World!</div>"
 */
export function html(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    // Handle arrays by joining them
    result += Array.isArray(val) ? val.join("") : String(val);
    result += strings[i + 1];
  }
  return result;
}

/**
 * Escape special HTML characters to prevent XSS attacks on content that will be rendered as HTML Tags.
 * This function replaces characters like <, >, &, ", and ' with their corresponding HTML entities.
 * ⚠️ this is a very basic escaping function and does not cover all edge cases of e.g. HTML attributes / style.
 * For production use, consider using a well-tested library for HTML escaping instead.
 *
 * @param {string} s - The string to escape
 * @returns {string} The escaped string
 *
 * @example
 * const unsafe = '<script>alert("XSS")</script>';
 * const safer = esc(unsafe);
 * // Returns: "&lt;script&gt;alert("XSS")&lt;/script&gt;"
 */
export function esc(s) {
  // TODO implement
  return s;
}
