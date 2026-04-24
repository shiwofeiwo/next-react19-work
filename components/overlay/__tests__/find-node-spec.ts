import findNode from '../utils/find-node';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * find-node.ts 的纯函数测试。
 *
 * 覆盖目标：
 * - 6 种 target 形态：null/false/undefined、string id、直接 DOM/Text、函数、RefObject、HasDOMNode
 * - 嵌套 RefObject（.current 递归解析）
 * - 异常路径（函数内抛错）
 * - 降级路径（无 getDOMNode 的裸 class 实例 → null + dev warn）
 */
describe('components/overlay/utils/find-node', () => {
    let el: HTMLDivElement;
    let elWithId: HTMLDivElement;
    let textNode: Text;
    const TEST_ID = 'find-node-spec-target';

    beforeEach(() => {
        el = document.createElement('div');
        el.className = 'find-node-spec-plain';
        document.body.appendChild(el);

        elWithId = document.createElement('div');
        elWithId.id = TEST_ID;
        document.body.appendChild(elWithId);

        textNode = document.createTextNode('find-node spec text');
        document.body.appendChild(textNode);
    });

    afterEach(() => {
        el.remove();
        elWithId.remove();
        textNode.parentNode?.removeChild(textNode);
    });

    describe('空值与假值', () => {
        it('null 返回 null', () => {
            assert(findNode(null) === null);
        });

        it('undefined 返回 null', () => {
            assert(findNode(undefined) === null);
        });

        it('false 返回 null', () => {
            assert(findNode(false) === null);
        });
    });

    describe('string id', () => {
        it('存在的 id 返回对应 DOM', () => {
            assert(findNode(TEST_ID) === elWithId);
        });

        it('不存在的 id 返回 null', () => {
            assert(findNode('find-node-spec-no-such-id') === null);
        });

        it('空字符串返回 null', () => {
            // @ts-expect-error 空串在 type 层是合法 string，但 runtime 上 getElementById 返回 null
            assert(findNode('') === null);
        });
    });

    describe('直接 DOM / Text 节点', () => {
        it('直接传 Element 返回该 Element', () => {
            assert(findNode(el) === el);
        });

        it('直接传 Text 节点返回该 Text', () => {
            assert(findNode(textNode) === textNode);
        });
    });

    describe('函数 target', () => {
        it('函数返回 Element', () => {
            assert(findNode(() => el) === el);
        });

        it('函数返回 null', () => {
            assert(findNode(() => null) === null);
        });

        it('函数返回 undefined', () => {
            assert(findNode(() => undefined) === null);
        });

        it('函数抛异常被吞掉，返回 null', () => {
            const fn = () => {
                throw new Error('intentional throw for spec');
            };
            assert(findNode(fn) === null);
        });

        it('函数接收 param 作为第一参数', () => {
            const fn = (p?: { hit?: HTMLElement }) => p?.hit ?? null;
            assert(findNode(fn, { hit: el }) === el);
        });
    });

    describe('RefObject', () => {
        it('RefObject.current 是 Element', () => {
            const ref = { current: el } as any;
            assert(findNode(ref) === el);
        });

        it('RefObject.current 是 null', () => {
            const ref = { current: null } as any;
            assert(findNode(ref) === null);
        });

        it('嵌套 RefObject（.current 指向另一个 RefObject）递归解析', () => {
            const inner = { current: el };
            const outer = { current: inner } as any;
            assert(findNode(outer) === el);
        });

        it('函数返回 RefObject', () => {
            const ref = { current: el } as any;
            assert(findNode(() => ref) === el);
        });

        it('RefObject.current 是实现了 getDOMNode 的实例', () => {
            const instance = { getDOMNode: () => el };
            const ref = { current: instance } as any;
            assert(findNode(ref) === el);
        });
    });

    describe('HasDOMNode 契约', () => {
        it('实现 getDOMNode 的对象，调用契约返回 DOM', () => {
            const inst = { getDOMNode: () => el };
            assert(findNode(inst) === el);
        });

        it('getDOMNode 返回 null', () => {
            const inst = { getDOMNode: () => null };
            assert(findNode(inst) === null);
        });

        it('函数返回实现 getDOMNode 的实例', () => {
            const inst = { getDOMNode: () => el };
            assert(findNode(() => inst) === el);
        });

        it('class 实例实现 getDOMNode 方法', () => {
            class FakeComponent {
                getDOMNode() {
                    return el;
                }
            }
            assert(findNode(new FakeComponent() as any) === el);
        });
    });

    describe('降级路径', () => {
        it('无 getDOMNode / current 的裸 class 实例返回 null', () => {
            class BareClass {}
            const inst = new BareClass();
            assert(findNode(inst as any) === null);
        });

        it('普通对象（既无 current 也无 getDOMNode）返回 null', () => {
            assert(findNode({ foo: 'bar' } as any) === null);
        });

        it('函数返回无 getDOMNode 的裸 class 实例返回 null', () => {
            class BareClass {}
            const inst = new BareClass();
            assert(findNode(() => inst as any) === null);
        });
    });
});
