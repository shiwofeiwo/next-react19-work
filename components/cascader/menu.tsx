import React, { Component, type ReactNode, type ComponentElement } from 'react';
import Menu, { type MenuProps } from '../menu';
import VirtualList from '../virtual-list';
import type { CascaderMenuProps, ItemProps } from './types';
import CascaderMenuItem from './item';

export default class CascaderMenu extends Component<CascaderMenuProps> {
    virtualEl: InstanceType<typeof VirtualList> | null;
    menuEl: HTMLDivElement;

    componentDidMount() {
        this.scrollToSelectedItem();
    }

    getDOMNode() {
        return this.menuEl;
    }

    scrollToSelectedItem() {
        const { prefix, useVirtual, children } = this.props;
        // FIXME 这里的判断很容易报错
        if (!children || (children as ReadonlyArray<ReactNode>).length === 0) {
            return;
        }
        const selectedIndex = children.findIndex(
            item => !!item.props.checked || !!item.props.selected || !!item.props.expanded
        );

        if (selectedIndex === -1) {
            return;
        }

        if (useVirtual) {
            const instance = this.virtualEl!.getInstance();
            setTimeout(() => instance.scrollTo(selectedIndex), 0);
        } else {
            const itemSelector = `.${prefix}menu-item`;
            const menu = this.menuEl;
            const targetItem = menu.querySelectorAll(itemSelector)[selectedIndex] as HTMLElement;
            if (targetItem) {
                menu.scrollTop =
                    targetItem.offsetTop -
                    Math.floor((menu.clientHeight / targetItem.clientHeight - 1) / 2) *
                        targetItem.clientHeight;
            }
        }
    }

    renderMenu(
        items: ReadonlyArray<ReactNode>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref: any,
        props: MenuProps
    ) {
        function isItem(node: ReactNode): node is ComponentElement<ItemProps, CascaderMenuItem> {
            // FIXME 这里的判断很容易报错，node.type 可以是 string 或者函数组件
            return (
                React.isValidElement(node) &&
                (node.type as typeof CascaderMenuItem).menuChildType === 'item'
            );
        }
        return (
            <Menu ref={ref as any} role="listbox" {...(props as any)}>
                {items.map(node => {
                    if (isItem(node)) {
                        return React.cloneElement(node, {
                            menu: this,
                        });
                    }

                    return node;
                })}
            </Menu>
        );
    }

    saveMenuRef = (ref: HTMLDivElement) => {
        this.menuEl = ref;
    };

    saveVirtualRef = (ref: InstanceType<typeof VirtualList>) => {
        this.virtualEl = ref;
    };

    render() {
        const { prefix, useVirtual, className, style, children, ...others } = this.props;
        const menuProps = {
            labelToggleChecked: false,
            className: `${prefix}cascader-menu`,
            ...others,
        };
        return (
            <div
                ref={this.saveMenuRef}
                className={`${prefix}cascader-menu-wrapper ${className ? className : ''}`}
                style={{
                    ...style,
                    backgroundColor: style?.backgroundColor ?? (useVirtual ? '#fff' : undefined),
                }}
            >
                {useVirtual ? (
                    <VirtualList
                        ref={this.saveVirtualRef}
                        itemsRenderer={(items, ref) => this.renderMenu(items, ref, menuProps)}
                    >
                        {children}
                    </VirtualList>
                ) : (
                    this.renderMenu(children as ReadonlyArray<ReactNode>, undefined, menuProps)
                )}
            </div>
        );
    }
}
