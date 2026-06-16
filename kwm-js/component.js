'use strict';

import {html} from "./html.js";
import {applyEvents} from "./directives/on.js";
import {effect, untrack} from "./observable.js";

/**
 * KWM Component base class
 *
 *
 * Extends HTMLElement and provides basic rendering with placeholders.
 *
 * @extends HTMLElement
 *
 * @example
 * class MyComponent extends Component {
 *   render() {
 *     return html`<div>Hello World</div>`;
 *   }
 * }
 * customElements.define('my-component', MyComponent);
 */
export class Component extends HTMLElement {
    #effect = null;

    connectedCallback() {
        try {
            this.#effect = effect(() => {
                const activeElementInfo = saveActiveElement(this);

                this.innerHTML = this.render();

                restoreActiveElement(this, activeElementInfo);

                queueMicrotask(() => {
                    untrack(() => {
                        applyEvents(this);
                    });
                });
            });
        } catch (error) {
            this.innerHTML = html`<p>Error rendering component: ${error.message}</p>`;
        }
    }

    render() {
        return html`<p>template: Override me I am the default</p>`
    }

    mount(container) {
        container.appendChild(this);
    }
}


function saveActiveElement(parent) {
    const active = document.activeElement;
    if (!active || !parent.contains(active)) return null;

    return {
        tagName: active.tagName,
        type: active.type,
        id: active.id,
        name: active.name,
        value: active.value,
        selectionStart: active.selectionStart,
        selectionEnd: active.selectionEnd,
        selectionDirection: active.selectionDirection,
    };
}

function restoreActiveElement(parent, info) {
    if (!info) return;
    const tag = info.tagName.toLowerCase();
    const target =
        (info.id && parent.querySelector(`#${CSS.escape(info.id)}`)) ||
        (info.name && parent.querySelector(`${tag}[name="${CSS.escape(info.name)}"]`)) ||
        [...parent.querySelectorAll(tag)].find(
            (el) => el.type === info.type && el.value === info.value,
        );
    if (target) {
        try {
            target.focus();
            target.setSelectionRange?.(info.selectionStart, info.selectionEnd, info.selectionDirection);
        } catch (e) {
            // Ignore if element doesn't support selection (e.g. select)
        }
    }
}
