import React, {
    Component,
    Children,
    cloneElement,
    type MouseEventHandler,
    type KeyboardEventHandler,
} from 'react';
import { polyfill } from 'react-lifecycles-compat';
import { func, KEYCODE } from '../util';
import Overlay from './overlay';
import type { PopupProps, PopupState } from './types';

const { noop, makeChain, bindCtx } = func;

/**
 * Overlay.Popup
 * 继承 Overlay 的 API，除非特别说明
 * */
class Popup extends Component<PopupProps, PopupState> {
    static defaultProps = {
        triggerType: 'hover',
        triggerClickKeycode: [KEYCODE.SPACE, KEYCODE.ENTER],
        defaultVisible: false,
        onVisibleChange: noop,
        disabled: false,
        autoFit: false,
        delay: 200,
        canCloseByTrigger: true,
        followTrigger: false,
        container: () => document.body,
        rtl: false,
    };

    static displayName = 'Popup';
    triggerRef: Element | null = null;
    _mouseNotFirstOnMask: boolean;
    _isForwardContent: boolean | null;
    overlay: InstanceType<typeof Overlay> | null;
    _timer: number | null;
    _hideTimer: number | null;
    _showTimer: number | null;

    constructor(props: PopupProps) {
        super(props);

        this.state = {
            visible: typeof props.visible === 'undefined' ? props.defaultVisible : props.visible,
        };

        bindCtx(this, [
            'handleTriggerClick',
            'handleTriggerKeyDown',
            'handleTriggerMouseEnter',
            'handleTriggerMouseLeave',
            'handleTriggerFocus',
            'handleTriggerBlur',
            'handleContentMouseEnter',
            'handleContentMouseLeave',
            'handleContentMouseDown',
            'handleRequestClose',
            'handleMaskMouseEnter',
            'handleMaskMouseLeave',
        ]);
    }

    static getDerivedStateFromProps(nextProps: PopupProps, prevState: PopupState) {
        if ('visible' in nextProps) {
            return {
                ...prevState,
                visible: nextProps.visible,
            };
        }

        return null;
    }

    componentWillUnmount() {
        (['_timer', '_hideTimer', '_showTimer'] as const).forEach(time => {
            this[time] && clearTimeout(this[time]!);
        });
    }

    saveTriggerRef = (ref: Element | null) => {
        this.triggerRef = ref;
    };

    handleVisibleChange(visible: boolean, type: string | object, e?: MouseEvent | KeyboardEvent) {
        if (!('visible' in this.props)) {
            this.setState({
                visible,
            });
        }

        this.props.onVisibleChange!(visible, type, e);
    }

    handleTriggerClick(e: MouseEvent | KeyboardEvent) {
        if (this.state.visible && !this.props.canCloseByTrigger) {
            return;
        }

        this.handleVisibleChange(!this.state.visible, 'fromTrigger', e);
    }

    handleTriggerKeyDown(e: KeyboardEvent) {
        const { triggerClickKeycode } = this.props;
        const keycodes = Array.isArray(triggerClickKeycode)
            ? triggerClickKeycode
            : [triggerClickKeycode];
        if (keycodes.includes(e.keyCode)) {
            e.preventDefault();
            this.handleTriggerClick(e);
        }
    }

    handleTriggerMouseEnter(e: MouseEvent) {
        this._mouseNotFirstOnMask = false;

        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        if (this._showTimer) {
            clearTimeout(this._showTimer);
            this._showTimer = null;
        }
        if (!this.state.visible) {
            this._showTimer = window.setTimeout(
                () => {
                    this.handleVisibleChange(true, 'fromTrigger', e);
                },
                this.props.mouseEnterDelay === null || this.props.mouseEnterDelay === undefined
                    ? this.props.delay
                    : this.props.mouseEnterDelay
            );
        }
    }

    handleTriggerMouseLeave(e: MouseEvent, type: string | object) {
        if (this._showTimer) {
            clearTimeout(this._showTimer);
            this._showTimer = null;
        }
        if (this.state.visible) {
            this._hideTimer = window.setTimeout(
                () => {
                    this.handleVisibleChange(false, type || 'fromTrigger', e);
                },
                this.props.mouseLeaveDelay === null || this.props.mouseLeaveDelay === undefined
                    ? this.props.delay
                    : this.props.mouseLeaveDelay
            );
        }
    }

    handleTriggerFocus(e: MouseEvent) {
        this.handleVisibleChange(true, 'fromTrigger', e);
    }

    handleTriggerBlur(e: MouseEvent) {
        if (!this._isForwardContent) {
            this.handleVisibleChange(false, 'fromTrigger', e);
        }
        this._isForwardContent = false;
    }

    handleContentMouseDown() {
        this._isForwardContent = true;
    }

    handleContentMouseEnter() {
        clearTimeout(this._hideTimer!);
    }

    handleContentMouseLeave(e: MouseEvent) {
        this.handleTriggerMouseLeave(e, 'fromContent');
    }

    handleMaskMouseEnter() {
        if (!this._mouseNotFirstOnMask) {
            clearTimeout(this._hideTimer!);
            this._hideTimer = null;
            this._mouseNotFirstOnMask = false;
        }
    }

    handleMaskMouseLeave() {
        this._mouseNotFirstOnMask = true;
    }

    handleRequestClose(type: string | object, e: MouseEvent) {
        this.handleVisibleChange(false, type, e);
    }

    renderTrigger() {
        const { trigger, disabled } = this.props;
        const props = {
            key: 'trigger',
            'aria-haspopup': true,
            'aria-expanded': this.state.visible,
        } as {
            key: string;
            'aria-haspopup': boolean;
            'aria-expanded': boolean;
            'aria-describedby': string | undefined;
            onClick: MouseEventHandler;
            onKeyDown: KeyboardEventHandler;
            onMouseEnter: MouseEventHandler;
            onMouseLeave: MouseEventHandler;
            onFocus: MouseEventHandler;
            onBlur: MouseEventHandler;
        };

        if (!this.state.visible) {
            props['aria-describedby'] = undefined;
        }

        if (!disabled) {
            const { triggerType } = this.props;
            const triggerTypes = Array.isArray(triggerType) ? triggerType : [triggerType];
            const { onClick, onKeyDown, onMouseEnter, onMouseLeave, onFocus, onBlur } =
                (trigger && trigger.props) || {};
            triggerTypes.forEach(triggerType => {
                switch (triggerType) {
                    case 'click':
                        props.onClick = makeChain(this.handleTriggerClick, onClick);
                        props.onKeyDown = makeChain(this.handleTriggerKeyDown, onKeyDown);
                        break;
                    case 'hover':
                        props.onMouseEnter = makeChain(this.handleTriggerMouseEnter, onMouseEnter);
                        props.onMouseLeave = makeChain(this.handleTriggerMouseLeave, onMouseLeave);
                        break;
                    case 'focus':
                        props.onFocus = makeChain(this.handleTriggerFocus, onFocus);
                        props.onBlur = makeChain(this.handleTriggerBlur, onBlur);
                        break;
                    default:
                        break;
                }
            });
        }

        return (
            trigger &&
            cloneElement(trigger, {
                ...props,
                ref: makeChain(this.saveTriggerRef as any, (trigger as any).ref),
            })
        );
    }

    renderContent() {
        const { children, triggerType } = this.props;
        const triggerTypes = Array.isArray(triggerType) ? triggerType : [triggerType];
        const content = Children.only(children);
        const { onMouseDown, onMouseEnter, onMouseLeave } = content!.props;
        const props = {
            key: 'portal',
        } as {
            onMouseDown?: MouseEventHandler;
            onMouseEnter?: MouseEventHandler;
            onMouseLeave?: MouseEventHandler;
        };

        triggerTypes.forEach(triggerType => {
            switch (triggerType) {
                case 'focus':
                    props.onMouseDown = makeChain(this.handleContentMouseDown, onMouseDown);
                    break;
                case 'hover':
                    props.onMouseEnter = makeChain(this.handleContentMouseEnter, onMouseEnter);
                    props.onMouseLeave = makeChain(this.handleContentMouseLeave, onMouseLeave);
                    break;
                default:
                    break;
            }
        });

        return cloneElement(content!, props);
    }

    renderPortal() {
        const {
            target,
            safeNode,
            followTrigger,
            triggerType,
            hasMask,
            wrapperStyle,
            v2,
            ...others
        } = this.props;
        let { container } = this.props;
        const findTriggerNode = () => {
            const ref = this.triggerRef;
            if (!ref) return null;
            if (ref instanceof Element) return ref;
            if ('getDOMNode' in ref && typeof (ref as any).getDOMNode === 'function') {
                return (ref as any).getDOMNode();
            }
            return null;
        };
        const safeNodes = Array.isArray(safeNode) ? [...safeNode] : [safeNode];
        safeNodes.unshift(findTriggerNode);

        const newWrapperStyle = wrapperStyle || {};

        if (followTrigger) {
            container = (trigger: HTMLElement) => (trigger && trigger.parentNode) || trigger;
            newWrapperStyle.position = 'relative';
        }

        if (triggerType === 'hover' && hasMask) {
            others.onMaskMouseEnter = this.handleMaskMouseEnter;
            others.onMaskMouseLeave = this.handleMaskMouseLeave;
        }

        return (
            <Overlay
                {...others}
                key="overlay"
                ref={overlay => {
                    this.overlay = overlay;
                }}
                visible={this.state.visible}
                target={target || findTriggerNode}
                container={container}
                safeNode={safeNodes}
                wrapperStyle={newWrapperStyle}
                triggerType={triggerType}
                hasMask={hasMask}
                onRequestClose={this.handleRequestClose}
            >
                {this.props.children && this.renderContent()}
            </Overlay>
        );
    }

    render() {
        return [this.renderTrigger(), this.renderPortal()];
    }
}

export default polyfill(Popup);
