import { fiberShim } from '../fiber-shim';

/* eslint-disable @typescript-eslint/no-explicit-any */

// React WorkTag 常量（与 fiber-shim.ts 保持一致）
const HOST_COMPONENT = 5;
const HOST_TEXT = 6;
const CLASS_COMPONENT = 1;

function makeFiber(tag: number, stateNode: unknown, child: any = null, sibling: any = null) {
    return { tag, stateNode, child, sibling };
}

function makeInstance(fiber: unknown, useLegacyKey = false) {
    return useLegacyKey ? { _reactInternalFiber: fiber } : { _reactInternals: fiber };
}

describe('components/util/fiber-shim', () => {
    let div: HTMLDivElement;
    let span: HTMLSpanElement;
    let textNode: Text;

    beforeEach(() => {
        div = document.createElement('div');
        span = document.createElement('span');
        textNode = document.createTextNode('hello');
    });

    describe('空值与非对象', () => {
        it('null 返回 null', () => {
            assert(fiberShim(null) === null);
        });

        it('undefined 返回 null', () => {
            assert(fiberShim(undefined) === null);
        });

        it('字符串返回 null', () => {
            assert(fiberShim('string' as any) === null);
        });

        it('数字返回 null', () => {
            assert(fiberShim(42 as any) === null);
        });

        it('普通对象（无 _reactInternals）返回 null', () => {
            assert(fiberShim({ foo: 'bar' }) === null);
        });
    });

    describe('直接是 HostComponent (tag=5)', () => {
        it('stateNode 是 Element，返回该 Element', () => {
            const fiber = makeFiber(HOST_COMPONENT, div);
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === div);
        });

        it('通过 _reactInternalFiber（React 16 遗留字段）也能解析', () => {
            const fiber = makeFiber(HOST_COMPONENT, div);
            const instance = makeInstance(fiber, true);
            assert(fiberShim(instance) === div);
        });
    });

    describe('直接是 HostText (tag=6)', () => {
        it('stateNode 是 Text 节点，返回该 Text', () => {
            const fiber = makeFiber(HOST_TEXT, textNode);
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === textNode);
        });
    });

    describe('ClassComponent 包裹 HostComponent（DFS 子树）', () => {
        it('class fiber → child HOST_COMPONENT → 返回 child stateNode', () => {
            const hostFiber = makeFiber(HOST_COMPONENT, div);
            const classFiber = makeFiber(CLASS_COMPONENT, null, hostFiber);
            const instance = makeInstance(classFiber);
            assert(fiberShim(instance) === div);
        });

        it('DFS 优先找第一个 HostComponent，忽略后续 sibling', () => {
            const firstHost = makeFiber(HOST_COMPONENT, div);
            const secondHost = makeFiber(HOST_COMPONENT, span);
            firstHost.sibling = secondHost;
            const classFiber = makeFiber(CLASS_COMPONENT, null, firstHost);
            const instance = makeInstance(classFiber);
            assert(fiberShim(instance) === div);
        });

        it('第一个 child 无 host，走 sibling 找到 HostComponent', () => {
            const unknownFiber = makeFiber(999, null, null, null);
            const hostFiber = makeFiber(HOST_COMPONENT, span);
            unknownFiber.sibling = hostFiber;
            const classFiber = makeFiber(CLASS_COMPONENT, null, unknownFiber);
            const instance = makeInstance(classFiber);
            assert(fiberShim(instance) === span);
        });

        it('多层嵌套 class，最终找到 HostComponent', () => {
            const hostFiber = makeFiber(HOST_COMPONENT, div);
            const innerClass = makeFiber(CLASS_COMPONENT, null, hostFiber);
            const outerClass = makeFiber(CLASS_COMPONENT, null, innerClass);
            const instance = makeInstance(outerClass);
            assert(fiberShim(instance) === div);
        });
    });

    describe('stateNode 类型不是 Element / Text', () => {
        it('stateNode 为 null，跳过该 fiber 返回 null', () => {
            const fiber = makeFiber(HOST_COMPONENT, null);
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === null);
        });

        it('stateNode 为普通对象，跳过该 fiber 返回 null', () => {
            const fiber = makeFiber(HOST_COMPONENT, { not: 'a-dom-node' });
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === null);
        });
    });

    describe('未知 tag，子树为空', () => {
        it('tag=999 且无 child，返回 null', () => {
            const fiber = makeFiber(999, null);
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === null);
        });
    });

    describe('容错：fiber 结构异常不抛错', () => {
        it('_reactInternals 为 null 时不崩溃，返回 null', () => {
            const instance = { _reactInternals: null };
            assert(fiberShim(instance) === null);
        });

        it('child 链表循环引用不崩溃（手动设置 child.child = 自身 → 会栈溢出，这里只测 null child）', () => {
            // 正常 DFS 遍历，只验证遇到 child=null 时正确终止
            const fiber = makeFiber(CLASS_COMPONENT, null, null);
            const instance = makeInstance(fiber);
            assert(fiberShim(instance) === null);
        });

        it('fiber 访问时抛错，被 try/catch 捕获，返回 null', () => {
            const throwingFiber = {
                get tag(): number {
                    throw new Error('simulated fiber access error');
                },
                stateNode: null,
                child: null,
                sibling: null,
            };
            const instance = { _reactInternals: throwingFiber };
            assert(fiberShim(instance) === null);
        });
    });
});
