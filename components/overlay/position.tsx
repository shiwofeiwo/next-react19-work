import React, { Component, Children, cloneElement, isValidElement } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { func, dom, events } from '../util';
import position from './utils/position';
import findNode from './utils/find-node';
import { warning } from '../util/log';
import type { PositionProps } from './types';

const { noop, bindCtx } = func;
const { getStyle } = dom;
const place = position.place;
// Follow react NESTED_UPDATE_LIMIT = 50
const MAX_UPDATE_COUNT = 50;

export default class Position extends Component<PositionProps> {
    static displayName = 'Position';
    static VIEWPORT = position.VIEWPORT;

    static defaultProps = {
        align: 'tl bl',
        offset: [0, 0],
        beforePosition: noop,
        onPosition: noop,
        needAdjust: true,
        autoFit: false,
        needListenResize: true,
        shouldUpdatePosition: false,
        rtl: false,
    };
    resizeObserver: ResizeObserver;
    shouldUpdatePosition: boolean;

    updateCount = 0;
    resizeTimeout: number;
    containerRef: HTMLElement | null = null;
    private existingChildRef: React.Ref<unknown> | null = null;

    constructor(props: PositionProps) {
        super(props);

        bindCtx(this, ['handleResize']);

        this.resizeObserver = new ResizeObserver(this.handleResize);
    }

    componentDidMount() {
        this.setPosition();

        if (this.props.needListenResize) {
            if (typeof window !== 'undefined') {
                events.on(window, 'resize', this.handleResize);
            }
            this.observe();
        }
    }

    componentDidUpdate(prevProps: PositionProps) {
        const { props } = this;

        if (('align' in props && props.align !== prevProps.align) || props.shouldUpdatePosition) {
            this.shouldUpdatePosition = true;
        }

        if (this.shouldUpdatePosition) {
            clearTimeout(this.resizeTimeout);

            this.setPosition();
            this.shouldUpdatePosition = false;
        }

        // handleChildRef 是稳定引用，React 19 不会因为 re-render 重新 attach ref。
        // 如果 parent 在两次 render 之间换了新的 child ref，此处手动同步，
        // 避免旧 ref 仍指向当前节点、新 ref 始终为 null。
        const prevRef = Position.readChildRef(prevProps);
        const nextRef = Position.readChildRef(this.props);
        if (prevRef !== nextRef) {
            Position.applyRef(prevRef, null);
            this.existingChildRef = nextRef;
            Position.applyRef(nextRef, this.containerRef);
        }
    }

    componentWillUnmount() {
        if (this.props.needListenResize) {
            events.off(window, 'resize', this.handleResize);
            this.unobserve();
        }

        clearTimeout(this.resizeTimeout);
    }

    observe = () => {
        const contentNode = this.getContentNode();
        contentNode && this.resizeObserver.observe(contentNode);
    };

    unobserve = () => {
        this.resizeObserver.disconnect();
    };

    shouldIgnorePosition = () => {
        const node = this.getContentNode();
        if (typeof window === 'undefined') {
            return true;
        }
        if (!node) {
            return true;
        }
        // 从文档中移除
        if (!node.parentNode) {
            return true;
        }
        // 元素隐藏
        const { position, display, visibility } = getComputedStyle(node);
        if (!node.offsetParent && position !== 'fixed') {
            return true;
        }
        // Firefox offsetParent 会返回 body，这里兼容处理
        if (display === 'none' || visibility === 'hidden') {
            return true;
        }
        // 兜底处理，同步进程里连续更新多次，强制中断
        this.updateCount++;
        Promise.resolve().then(() => {
            this.updateCount = 0;
        });
        if (this.updateCount > MAX_UPDATE_COUNT - 10) {
            warning(
                'Over maximum times to adjust position at one task, it is recommended to use v2.'
            );
            return true;
        }
        return false;
    };

    setPosition() {
        const {
            align,
            offset,
            beforePosition,
            onPosition,
            needAdjust,
            container,
            rtl,
            pinFollowBaseElementWhenFixed,
            autoFit,
        } = this.props;

        if (this.shouldIgnorePosition()) {
            return;
        }

        beforePosition();

        const contentNode = this.getContentNode();
        const targetNode = this.getTargetNode();

        if (contentNode && targetNode) {
            const resultAlign = place({
                pinElement: contentNode,
                baseElement: targetNode,
                pinFollowBaseElementWhenFixed,
                align,
                offset,
                autoFit,
                container,
                needAdjust,
                isRtl: rtl,
            } as PositionProps);
            const top = getStyle(contentNode, 'top');
            const left = getStyle(contentNode, 'left');

            onPosition(
                {
                    align: resultAlign!.split(' '),
                    top,
                    left,
                },
                contentNode
            );
        }
    }

    getContentNode(): null | HTMLElement {
        if (this.containerRef) {
            return this.containerRef;
        }
        return null;
    }

    getTargetNode() {
        const { target } = this.props;

        return target === position.VIEWPORT ? position.VIEWPORT : findNode(target, this.props);
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);

        this.resizeTimeout = window.setTimeout(() => {
            this.setPosition();
        }, 200);
    }

    // 稳定引用：每次 render 都是同一个函数，React 19 不会因 callback identity 变化
    // 而在 re-render 时 fire cleanup，cleanup 仅在 unmount 时触发一次。
    private handleChildRef = (c: unknown): (() => void) => {
        if (c instanceof Element) {
            this.containerRef = c as HTMLElement;
        } else if (c && typeof (c as { getDOMNode?: unknown }).getDOMNode === 'function') {
            this.containerRef = (c as { getDOMNode: () => HTMLElement }).getDOMNode();
        } else if (c && typeof c === 'object' && 'current' in c) {
            // 兼容部分组件通过 useImperativeHandle 暴露 RefObject-like handle 的场景
            this.containerRef = (c as React.RefObject<HTMLElement>).current;
        }

        Position.applyRef(this.existingChildRef, c);

        return () => {
            this.containerRef = null;
            Position.applyRef(this.existingChildRef, null);
        };
    };

    private static readChildRef(props: PositionProps): React.Ref<unknown> | null {
        const child = Children.only(props.children);
        if (!isValidElement(child)) return null;
        return (child as { props?: { ref?: React.Ref<unknown> } }).props?.ref ?? null;
    }

    private static applyRef(ref: React.Ref<unknown> | null, value: unknown) {
        if (typeof ref === 'function') {
            ref(value);
        } else if (ref && typeof ref === 'object' && 'current' in ref) {
            (ref as React.MutableRefObject<unknown>).current = value;
        }
    }

    render() {
        const child = Children.only(this.props.children);
        if (isValidElement(child)) {
            // 每次 render 都刷新 existingChildRef，供稳定的 handleChildRef 读取。
            this.existingChildRef = Position.readChildRef(this.props);
            return cloneElement<any>(child, { ref: this.handleChildRef });
        }
        return child;
    }
}
