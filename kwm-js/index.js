'use strict';

/**
 * KWM-JS: micro framework
 *
 * Features:
 * - html: Tagged template literal for HTML strings
 * - esc: HTML escaping for XSS protection
 * - Component: Base class for web components
 * - Router: Simple hash-based router
 * - observable: Basic observable for reactive state management
 */

export { html, esc } from "./html.js";
export { Component } from "./component.js";
export { Router } from "./router.js";
export { observable, untrack, effect } from "./observable.js";
export { on } from "./directives/on.js";
