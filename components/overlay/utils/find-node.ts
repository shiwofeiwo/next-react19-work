import { isProduction } from '../../util/env';
import type { Target } from '../types';

function getNodeFromInstance(instance: unknown): Element | Text | null {
    if (!instance) return null;
    if (instance instanceof Element || instance instanceof Text) {
        return instance;
    }
    // RefObject（含 React.useRef 的返回值）：递归解析 current
    if (typeof instance === 'object' && 'current' in (instance as object)) {
        return getNodeFromInstance((instance as { current: unknown }).current);
    }
    // React class component instance — try getDOMNode()
    if (
        'getDOMNode' in (instance as object) &&
        typeof (instance as Record<string, unknown>).getDOMNode === 'function'
    ) {
        return (instance as { getDOMNode: () => Element | Text | null }).getDOMNode();
    }
    // 开发环境提示：组件实例没有 getDOMNode()，Overlay 将拿不到 target DOM 节点。
    // React 19 已移除 ReactDOM.findDOMNode，Class 组件作为 Overlay target 必须显式实现 getDOMNode()。
    /* eslint-disable no-console */
    if (!isProduction() && typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn(
            'Warning: [Overlay] target resolved to a component instance without getDOMNode(). ' +
                'Class components used as Overlay/Balloon/Tooltip target must implement getDOMNode() ' +
                'since React 19 removed ReactDOM.findDOMNode. Offending instance:',
            instance
        );
    }
    /* eslint-enable no-console */
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
