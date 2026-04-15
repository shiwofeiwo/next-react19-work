import React, { Component } from 'react';
import classNames from 'classnames';
import Menu from '../menu';
import NavContext, { type NavContextValue } from './context';
import type { GroupProps } from './types';

/**
 * Nav.Group
 * @remarks 继承自 `Menu.Group` 的能力请查看 `Menu.Group` 文档
 */
class Group extends Component<GroupProps> {
    static menuChildType = 'group';

    static contextType = NavContext;

    render() {
        const { prefix, iconOnly } = this.context as NavContextValue;
        const { className, children, label, ...others } = this.props;

        let newLabel = label;
        if (iconOnly) {
            // TODO: add a group icon ?
            newLabel = [<span key="label">{label}</span>];
        }

        const cls = classNames({
            [`${prefix}nav-group-label`]: true,
            [className!]: !!className,
        });

        return (
            <Menu.Group className={cls} label={newLabel} {...others}>
                {children}
            </Menu.Group>
        );
    }
}

export default Group;
