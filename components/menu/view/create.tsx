import { createRoot } from 'react-dom/client';
import React, { Component, type ComponentRef } from 'react';
import cx from 'classnames';
import Overlay, { type OverlayProps } from '../../overlay';
import { func, type ClassPropsWithDefault } from '../../util';
import ConfigProvider from '../../config-provider';
import menu from './menu';
import type { CreateMenuProps, MenuProps } from '../types';

const { bindCtx } = func;
const { getContextProps } = ConfigProvider;
const Menu = ConfigProvider.config(menu);

let menuInstance:
    | {
          destroy(): void;
      }
    | null
    | undefined;

interface ContextMenuState {
    visible: boolean;
}

class ContextMenu extends Component<CreateMenuProps, ContextMenuState> {
    static defaultProps = {
        prefix: 'next-',
        align: 'tl tl',
        mode: 'popup',
    };

    overlay: ComponentRef<typeof Overlay> | null | undefined;
    popupNodes: HTMLElement[] = [];

    constructor(props: CreateMenuProps) {
        super(props);

        this.state = {
            visible: true,
        };

        bindCtx(this, ['handleOverlayClose', 'handleOverlayOpen', 'handleItemClick', 'getOverlay']);
    }

    getOverlay(ref: ComponentRef<typeof Overlay> | null) {
        this.overlay = ref;
    }

    close() {
        this.setState({
            visible: false,
        });
        menuInstance = null;
    }

    handleOverlayClose: OverlayProps['onRequestClose'] = (triggerType, e, ...others) => {
        const clickedPopupMenu =
            triggerType === 'docClick' &&
            this.popupNodes.some(node => node.contains(e.target as Node));
        if (!clickedPopupMenu) {
            this.close();
            const { overlayProps } = this.props;
            if (overlayProps && overlayProps.onRequestClose) {
                overlayProps.onRequestClose(triggerType, e, ...others);
            }
        }
    };

    handleOverlayOpen() {
        // 遍历 getInstance()/getContent() 链拿到内层 Menu 实例上的 popupNodes。
        // React 19 迁移后，cloneElement + class component ref 的链路可能不稳定——
        // 中间任一节点拿不到实例时，退化为空数组（handleOverlayClose 仅用它做包含性检查，空数组退化为"点外部都算外部"，语义上等同无 popup 子菜单时的行为）。
        const overlayInstance = this.overlay?.getInstance?.();
        const contentRef = overlayInstance?.getContent?.();
        const innerMenu =
            contentRef &&
            typeof (contentRef as { getInstance?: unknown }).getInstance === 'function'
                ? (
                      contentRef as unknown as { getInstance: () => { popupNodes?: HTMLElement[] } }
                  ).getInstance()
                : (contentRef as { popupNodes?: HTMLElement[] } | null);
        this.popupNodes = innerMenu?.popupNodes ?? [];
        const { overlayProps } = this.props;
        if (overlayProps && overlayProps.onOpen) {
            overlayProps.onOpen();
        }
    }

    handleItemClick: NonNullable<CreateMenuProps['onItemClick']> = (...args) => {
        this.close();

        this.props.onItemClick && this.props.onItemClick(...args);
    };

    render() {
        const {
            className,
            popupClassName,
            target,
            align,
            offset,
            afterClose,
            overlayProps = {},
            ...others
        } = this.props;
        const contextProps = getContextProps(this.props);
        const { prefix } = contextProps;
        const { visible } = this.state;

        const newOverlayProps = {
            ...contextProps,
            ...overlayProps,
            target,
            align: align as string,
            offset,
            afterClose,
            visible,
            onRequestClose: this.handleOverlayClose,
            onOpen: this.handleOverlayOpen,
            ref: this.getOverlay,
        };
        const menuProps: MenuProps = {
            ...contextProps,
            triggerType: 'hover',
            ...others,
            className: cx(`${prefix}context`, className),
            popupClassName: cx(`${prefix}context`, popupClassName),
            onItemClick: this.handleItemClick,
        };

        newOverlayProps.rtl = false;

        return (
            <Overlay {...newOverlayProps}>
                <Menu {...menuProps} />
            </Overlay>
        );
    }
}

/**
 * 创建上下文菜单
 */
export default function create(props: CreateMenuProps) {
    if (menuInstance) {
        menuInstance.destroy();
    }

    /* eslint-disable no-unused-vars */
    const { afterClose, ...others } = props;
    /* eslint-enable no-unused-vars */

    const div = document.createElement('div');
    document.body.appendChild(div);

    const closeChain = () => {
        const root = createRoot(div);
        root.unmount();
        document.body.removeChild(div);

        afterClose && afterClose();
    };

    const newContext = ConfigProvider.getContext();

    let menu: ContextMenu | null;
    const root = createRoot(div);

    root.render(
        <ConfigProvider {...newContext}>
            <ContextMenu
                ref={ref => {
                    menu = ref;
                }}
                afterClose={closeChain}
                {...others}
            />
        </ConfigProvider>
    );

    menuInstance = {
        destroy: () => {
            if (menu) {
                menu.close();
            }
        },
    };

    return menuInstance;
}
