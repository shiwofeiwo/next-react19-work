import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { mount, type MountReturn, type MountOptions } from 'cypress/react';
import './commands';

/**
 * React 19 concurrent mode 下 `root.render()` 的 commit 可能在 microtask 队列调度，
 * 而 cypress-react 内部的 `cy.wait(0)` 使用 setTimeout(0) 调度——二者不保证 commit 在 wait 之前完成。
 * 结果：`cy.mount(...).then(() => ref.current)` 常拿到 null，因为 React 此刻还没 attach ref。
 *
 * 解法：在 mount 命令完成后追加一次 `cy.wait(0)`，给 React 多一个事件循环 tick 完成 commit + ref 附着。
 * 这是对 framework 层 timing race 的兜底，不需要每个测试单独补重试。
 */
function mountWithRefTick(
    jsx: ReactNode,
    options?: MountOptions,
    rerenderKey?: string
): Cypress.Chainable<MountReturn> {
    return mount(jsx, options, rerenderKey).then(result => {
        return cy.wait(0, { log: false }).then(() => result);
    }) as unknown as Cypress.Chainable<MountReturn>;
}

function rerender<Props extends object>(tag: string, nextProps: Props) {
    return cy.get<MountReturn>(`@${tag.replace(/^@/, '')}`).then(({ component, rerender }) => {
        // Same React 19 commit timing fix as mountWithRefTick: wait one tick after rerender
        return rerender(cloneElement(component as ReactElement, nextProps)).then(result => {
            return cy.wait(0, { log: false }).then(() => result);
        }) as unknown as Cypress.Chainable<MountReturn>;
    });
}

function triggerInputChange(subject: JQuery<HTMLElement>, value: string) {
    const element = subject[0];
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    )?.set;
    nativeInputValueSetter?.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            mount: typeof mount;
            rerender: typeof rerender;
            triggerInputChange: (value: string) => void;
        }
    }
}

Cypress.Commands.add('mount', mountWithRefTick);
Cypress.Commands.add('rerender', rerender);
Cypress.Commands.add('triggerInputChange', { prevSubject: 'element' }, triggerInputChange)
