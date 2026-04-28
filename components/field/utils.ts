import { isValidElement, cloneElement, type ReactElement, type ReactInstance } from 'react';
import { isProduction } from '../util/env';
import { fiberShim } from '../util/fiber-shim';
import { type ScrollToFirstErrorOption } from './types';

export function cloneAndAddKey(element: ReactElement<any>) {
    if (element && isValidElement(element)) {
        const key = element.key || 'error';
        return cloneElement(element, { key });
    }
    return element;
}

export function scrollToFirstError({ errorsGroup, options, instance }: ScrollToFirstErrorOption) {
    if (errorsGroup && options.scrollToFirstError) {
        let firstNode: HTMLElement | undefined;
        let firstTop: number | undefined;
        for (const i in errorsGroup) {
            if (errorsGroup.hasOwnProperty(i)) {
                const ref = instance[i] as ReactInstance;
                const node =
                    ref instanceof Element
                        ? (ref as HTMLElement)
                        : ((ref as any)?.getDOMNode?.() as HTMLElement) ??
                          (fiberShim(ref) as HTMLElement | null);
                if (!node) {
                    // 原版失败即 return 会跳过后续字段；改为 continue 以便定位到其他错误字段
                    /* eslint-disable no-console */
                    if (
                        !isProduction() &&
                        typeof console !== 'undefined' &&
                        typeof console.warn === 'function'
                    ) {
                        console.warn(
                            'Warning: [Form.scrollToFirstError] field instance has no resolvable DOM. ' +
                                'Class components registered as Field must implement getDOMNode() ' +
                                'since React 19 removed ReactDOM.findDOMNode. Skipping field:',
                            i
                        );
                    }
                    /* eslint-enable no-console */
                    continue;
                }
                const top = node.offsetTop;
                if (firstTop === undefined || firstTop > top) {
                    firstTop = top;
                    firstNode = node;
                }
            }
        }

        if (firstNode) {
            if (
                typeof options.scrollToFirstError === 'number' &&
                window &&
                typeof window.scrollTo === 'function'
            ) {
                const offsetLeft =
                    document && document.body && document.body.offsetLeft
                        ? document.body.offsetLeft
                        : 0;
                window.scrollTo(offsetLeft, firstTop! + options.scrollToFirstError);
            } else if (
                'scrollIntoViewIfNeeded' in firstNode &&
                typeof firstNode.scrollIntoViewIfNeeded === 'function'
            ) {
                firstNode.scrollIntoViewIfNeeded(true);
            } else {
                firstNode.scrollIntoView({ block: 'center' });
            }
        }
    }
}
