/**
 * ⚠️ 依赖 React 私有 API（_reactInternals / fiber.tag 常量）。
 *
 * 用途：React 19 移除 ReactDOM.findDOMNode 后，为 Overlay/Balloon/Tooltip/Form 等组件
 * 提供"用户自定义 class 组件"场景的 DOM 反查兜底。
 *
 * 维护约束：React 主版本升级时必须人工核验 fiber 结构是否变化。
 * 失败路径必须返回 null，不能崩溃——退化行为等同于不装 shim。
 */

// React WorkTag 常量（自 React 16 起稳定至 React 19）
const HOST_COMPONENT = 5;
const HOST_TEXT = 6;

interface FiberLike {
    tag: number;
    stateNode: unknown;
    child: FiberLike | null;
    sibling: FiberLike | null;
}

function getFiberFromInstance(instance: unknown): FiberLike | null {
    if (!instance || typeof instance !== 'object') return null;
    const holder = instance as {
        _reactInternals?: FiberLike; // React 17+
        _reactInternalFiber?: FiberLike; // React 16 legacy
    };
    return holder._reactInternals ?? holder._reactInternalFiber ?? null;
}

function findHostFiberStateNode(fiber: FiberLike | null): Element | Text | null {
    if (!fiber) return null;
    if (fiber.tag === HOST_COMPONENT || fiber.tag === HOST_TEXT) {
        const node = fiber.stateNode;
        return node instanceof Element || node instanceof Text ? node : null;
    }
    let child = fiber.child;
    while (child) {
        const found = findHostFiberStateNode(child);
        if (found) return found;
        child = child.sibling;
    }
    return null;
}

export function fiberShim(instance: unknown): Element | Text | null {
    try {
        const fiber = getFiberFromInstance(instance);
        return fiber ? findHostFiberStateNode(fiber) : null;
    } catch {
        return null;
    }
}
