import { createRoot } from 'react-dom/client';
import React, { ReactElement, ElementType } from 'react';
import ReactDOM from 'react-dom';
import { create, ReactTestRendererTree } from 'react-test-renderer';

export const delay = (time: number) => new Promise<void>(resolve => setTimeout(resolve, time));
/**
 * 仅在渲染多个组件时使用，单一组件请使用cy.mount
 */
export function render<P = unknown>(element: ReactElement<P>) {
    let inc: any;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(element);
    return {
        setProps: (props: Partial<P>) => {
            const clonedElement = React.cloneElement(element, props);
            const root = createRoot(container);
            root.render(clonedElement);
        },
        unmount: () => {
            const root = createRoot(container);
            root.unmount();
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        },
        instance: () => {
            return inc;
        },
        find: (selector: string) => {
            return container.querySelectorAll(selector);
        },
    };
}

export function shallow<P = unknown>(element: ReactElement<P>) {
    const renderer = create(element);
    const tree = renderer.toTree();

    function visitTree(
        node: ReactTestRendererTree,
        visitor: (node: ReactTestRendererTree) => false | void
    ) {
        const result = visitor(node);
        if (result === false) {
            return false;
        }
        if (node.rendered) {
            const renderedArr = Array.isArray(node.rendered) ? node.rendered : [node.rendered];
            for (const subNode of renderedArr) {
                const res = visitTree(subNode, visitor);
                if (res === false) {
                    break;
                }
            }
        }
    }

    return {
        findByType(type: ElementType): null | unknown {
            if (!tree) {
                return null;
            }
            let ins: unknown = null;
            visitTree(tree, node => {
                if (node.instance instanceof (type as any)) {
                    ins = node.instance;
                    return false;
                }
            });
            return ins;
        },
    };
}

export default {
    delay,
    render,
    shallow,
};
