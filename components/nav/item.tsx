import React, { Component } from 'react';
import classNames from 'classnames';
import Menu from '../menu';
import Icon from '../icon';
import Balloon from '../balloon';
import NavContext, { type NavContextValue } from './context';
import type { ItemProps } from './types';

const { Tooltip } = Balloon;

/**
 * Nav.Item
 * @remarks 继承自 `Menu.Item` 的能力请查看 `Menu.Item` 文档
 */
class Item extends Component<ItemProps> {
    static menuChildType = 'item';

    static contextType = NavContext;

    render() {
        const { prefix, iconOnly, iconOnlyWidth, hasTooltip, iconTextOnly } = this
            .context as NavContextValue;
        const { icon, children, className, ...others } = this.props;
        const iconEl =
            typeof icon === 'string' ? <Icon className={`${prefix}nav-icon`} type={icon} /> : icon;

        let title;

        if (typeof children === 'string') {
            title = children;
        }

        const showChildren = !iconOnly || (iconOnly && !iconOnlyWidth) || iconTextOnly;
        const cls = classNames({
            [`${prefix}nav-with-title`]: iconOnly && iconTextOnly,
            [className!]: !!className,
        });

        const newChildren = showChildren ? (
            iconTextOnly ? (
                <span className={`${prefix}nav-text`}>{children}</span>
            ) : (
                children
            )
        ) : null;

        const item = (
            <Menu.Item title={title} className={cls} {...others}>
                {iconEl}
                {newChildren}
            </Menu.Item>
        );

        if (iconOnly && hasTooltip && others.parentMode !== 'popup') {
            return (
                <Tooltip align="r" trigger={item}>
                    {children}
                </Tooltip>
            );
        }

        return item;
    }
}

export default Item;
