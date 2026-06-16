let trackingContext = null;

/**
 * Runs a function without tracking observable reads.
 * @template T
 * @param {() => T} fn - The function to run untracked
 * @returns {T} The function's return value
 */
export function untrack(fn) {
    const prev = trackingContext;
    trackingContext = null;
    try {
        return fn();
    } finally {
        trackingContext = prev;
    }
}

function runTracked(fn) {
    const prev = trackingContext;
    const deps = new Set();
    trackingContext = deps;
    try {
        const result = fn();
        return { result, deps };
    } finally {
        trackingContext = prev;
    }
}

class Observable {
    constructor(initialValue) {
        this.current = initialValue;
        this.subscribers = new Set();
    }

    /**
     * Gets the current value and tracks the observable if within a tracking context.
     * @return {*}
     */
    get() {
        if (trackingContext) trackingContext.add(this);
        return this.current;
    }

    /**
     * Sets a new value and notifies subscribers if the value has changed.
     * @param val
     */
    set(val) {
        if (val === this.current) return;
        this.current = val;
        // Create a copy of subscribers to avoid issues if the set is modified during iteration
        for (const fn of [...this.subscribers]) fn(this.current);
    }

    subscribe(fn) {
        this.subscribers.add(fn);
        return () => this.subscribers.delete(fn);
    }

    toString() {
        return String(this.get());
    }
}

/**
 * Creates a new observable value.
 * @template T
 * @param {T} initialValue - The initial value
 * @returns {{ get: () => T, set: (val: T) => void, subscribe: (fn: () => void) => () => boolean }}
 * @example
 * const count = observable(0);
 * count.get(); // 0
 * count.set(1); // triggers subscribers
 */
export const observable = (initialValue) => new Observable(initialValue);

/**
 * Creates a computed value that updates automatically.
 * @template T
 * @param {() => T} fn - The computation function
 * @returns {{ get: () => T, subscribe: (fn: () => void) => () => boolean }}
 * @example
 * const count = observable(1);
 * const double = computed(() => count.get() * 2);
 * double.get(); // 2
 * count.set(2);
 * double.get(); // 4
 */
export function computed(fn) {
    let value;
    let initialized = false;
    let unsubs = [];
    const subscribers = new Set();

    function recompute() {
        cleanup();
        const { result, deps } = runTracked(fn);
        const oldValue = value;
        value = result;
        initialized = true;
        unsubs = [...deps].map((dep) => dep.subscribe(recompute));
        if (oldValue !== value) {
            // Create a copy of subscribers to avoid issues if the set is modified during iteration
            for (const s of [...subscribers]) s(result);
        }
    }

    function cleanup() {
        for (const u of unsubs) u();
        unsubs = [];
    }

    function ensureInitialized() {
        if (!initialized) recompute();
    }

    return {
        get() {
            ensureInitialized();
            if (trackingContext) trackingContext.add(this);
            return value;
        },
        subscribe(fn) {
            ensureInitialized();
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        },
        toString() {
            return String(this.get());
        },
    };
}

/**
 * Creates a side effect that runs when dependencies change.
 * @param {() => void} fn - The effect function
 * @returns {() => void} A dispose function to stop the effect
 * @example
 * effect(() => {
 *   console.log('Count is:', count.get()); // runs initially and whenever count changes
 * });
 */
export function effect(fn) {
    let unsubs = [];
    let disposed = false;
    let scheduled = false;

    function run() {
        if (disposed) return;
        scheduled = false;
        cleanup();
        const { deps } = runTracked(fn);
        unsubs = [...deps].map((dep) =>
            dep.subscribe(() => {
                if (disposed || scheduled) return;
                scheduled = true;
                queueMicrotask(run);
            }),
        );
    }

    function cleanup() {
        for (const u of unsubs) u();
        unsubs = [];
    }

    run();

    return () => {
        disposed = true;
        cleanup();
    };
}

