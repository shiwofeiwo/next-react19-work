import type { Target } from '../types';

function getNodeFromInstance(instance: unknown): Element | Text | null {
    if (!instance) return null;
    if (instance instanceof Element || instance instanceof Text) {
        return instance;
    }
    // React class component instance — try getDOMNode()
    if (
        'getDOMNode' in (instance as object) &&
        typeof (instance as Record<string, unknown>).getDOMNode === 'function'
    ) {
        return (instance as { getDOMNode: () => Element | Text | null }).getDOMNode();
    }
    return null;
}

export default function findNode<T>(target?: Target<T>, param?: T): Element | Text | null {
    let realTarget: typeof target | void = target;
    if (!realTarget) {
        return null;
    }

    if (typeof realTarget === 'string') {
        return document.getElementById(realTarget);
    }

    if (typeof realTarget === 'function') {
        try {
            realTarget = realTarget(param);
        } catch (err) {
            realTarget = null;
        }
    }

    if (!realTarget) {
        return null;
    }

    try {
        return getNodeFromInstance(realTarget);
    } catch (err) {
        return realTarget as Element | Text | null;
    }
}
