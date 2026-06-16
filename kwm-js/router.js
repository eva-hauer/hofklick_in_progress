'use strict';

/**
 * @typedef {Object} Route
 * @property {string} path - The route path (e.g., '/' or '/about')
 * @property {() => HTMLElement} component - Factory function that returns the component
 */

/**
 * Router for KWM-JS
 *
 * Simple hash-based routing without observables.
 * Matches routes by exact string only - no parameters.
 */
export class Router {
    #container;
    #routes;

    constructor(container, routes) {
        this.#container = container;
        this.#routes = routes;

        this.changeView();

        window.addEventListener('hashchange', () => {
            this.changeView();
        });
    }

    changeView() {
        const currentHash = window.location.hash; // '#/about'
        const currentPath = currentHash.slice(1) || '/'; // '/about'

        for (const route of this.#routes) {
            if (route.path === currentPath) {
                this.#container.innerHTML = ''; // Clear previous content
                route.component.mount(this.#container);
                return;
            }
        }

        this.#container.innerHTML = `<p>404 Not Found: ${currentPath}</p>`;
    }

    navigate(path) {
        window.location.hash = path;
    }
}
