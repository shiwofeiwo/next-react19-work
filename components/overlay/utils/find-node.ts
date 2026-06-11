import { isProduction } from '../../util/env';
import { fiberShim } from '../../util/fiber-shim';
import type { Target } from '../types';

export function getNodeFromInstance(instance: unknown): Element | Text | null {
    if (!instance) return null;
    // 跨 realm 安全：simulator 画布在 iframe 中，其 DOM 属于 iframe 的 realm，
    // `instanceof Element` 会判否；用 nodeType（ELEMENT_NODE=1 / TEXT_NODE=3）判定。
    const nodeType = (instance as { nodeType?: number }).nodeType;
    if (nodeType === 1 || nodeType === 3) {
        return instance as Element | Text;
    }
    // RefObject（含 React.useRef 的返回值）：递归解析 current
    if (typeof instance === 'object' && 'current' in (instance as object)) {
        return getNodeFromInstance((instance as { current: unknown }).current);
    }
    // React class component instance — try getDOMNode()
    // NOTE: getDOMNode() may return null if the component uses ReactDOM.findDOMNode internally
    // (removed in React 19). Fall through to fiberShim in that case.
    if (
        'getDOMNode' in (instance as object) &&
        typeof (instance as Record<string, unknown>).getDOMNode === 'function'
    ) {
        const result = (instance as { getDOMNode: () => Element | Text | null }).getDOMNode();
        if (result) return result;
    }
    // 用户自定义 class 组件兜底：从 React fiber 私有结构反查根 DOM
    const shimResult = fiberShim(instance);
    if (shimResult) return shimResult;
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
