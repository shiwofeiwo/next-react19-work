import React, { ReactElement, ElementType, act } from 'react';
import { render as rtlRender, type RenderResult } from '@testing-library/react';

export const delay = (time: number) => new Promise<void>(resolve => setTimeout(resolve, time));

/** 从 DOM 容器反查 React 19 的根 fiber */
function getFiberRoot(container: HTMLElement): unknown {
    const fiberKey = Object.keys(container).find(
        k => k.startsWith('__reactContainer$') || k.startsWith('__reactFiber$')
    );
    if (!fiberKey) return null;
    const rootOrFiber = (container as unknown as Record<string, unknown>)[fiberKey] as {
        stateNode?: { current?: unknown };
        current?: unknown;
    } | null;
    if (!rootOrFiber) return null;
    // __reactContainer$xxxxx 一般是 FiberRoot，其 stateNode.current 是 HostRoot fiber
    // __reactFiber$xxxxx 本身就是 fiber
    return rootOrFiber.stateNode?.current ?? rootOrFiber.current ?? rootOrFiber;
}

/** 深度优先遍历 fiber 树，找第一个 type === Component 的节点 */
function findFiberByType(node: unknown, type: ElementType): { stateNode?: unknown } | null {
    if (!node || typeof node !== 'object') return null;
    const n = node as {
        type?: unknown;
        child?: unknown;
        sibling?: unknown;
        stateNode?: unknown;
    };
    if (n.type === type) return n as { stateNode?: unknown };
    const childMatch = findFiberByType(n.child, type);
    if (childMatch) return childMatch;
    return findFiberByType(n.sibling, type);
}

/**
 * 仅在渲染多个组件时使用，单一组件请使用 cy.mount。
 *
 * 基于 testing-library/react 的 render，封装成旧签名：
 * - `setProps(partial)` —— 通过 cloneElement + RTL `rerender` 实现
 * - `unmount()` —— RTL 的 unmount + 清理自建容器
 * - `find(selector)` —— container 的 `querySelectorAll`
 * - `instance()` —— DOM-only 测试下已不可用，保留返回 undefined 以兼容旧调用
 */
export function render<P = unknown>(element: ReactElement<P>) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const result: RenderResult = rtlRender(element, { container, baseElement: document.body });

    return {
        setProps: (props: Partial<P>) => {
            const clonedElement = React.cloneElement(element, props);
            result.rerender(clonedElement);
        },
        unmount: () => {
            result.unmount();
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        },
        instance: (): unknown => undefined,
        find: (selector: string) => container.querySelectorAll(selector),
    };
}

/**
 * 轻量组件树查找工具（兼容旧 enzyme 风格 `findByType` 语义）。
 *
 * 设计背景：`@testing-library/react` 面向 DOM，不支持"按组件类型查找实例"。
 * 但本仓库有一类测试需要识别 `ErrorBoundary` 这种**无 DOM 产物**的 HOC 是否存在于树中——
 * 纯 DOM 断言做不到。这里用 RTL 渲染到脱离 body 的临时容器（不污染页面），
 * 再通过容器上的 `__reactContainer$xxxxx` 入口遍历 React 19 fiber 树，按 `type === Component` 匹配。
 *
 * ⚠️ fiber 结构属于 React 内部 API，仅限测试工具使用，业务代码禁止依赖。
 */
export function shallow<P = unknown>(element: ReactElement<P>) {
    const container = document.createElement('div');
    let result: RenderResult | undefined;
    act(() => {
        result = rtlRender(element, { container, baseElement: container });
    });

    return {
        findByType(type: ElementType): null | unknown {
            const rootFiber = getFiberRoot(container);
            const found = findFiberByType(rootFiber, type);
            // 类组件：stateNode 是实例；函数/forwardRef 组件：stateNode 通常为 null
            return found?.stateNode ?? null;
        },
        unmount: () => {
            result?.unmount();
        },
    };
}

export default {
    delay,
    render,
    shallow,
};
