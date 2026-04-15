import React, { Component } from 'react';
import cx from 'classnames';
import type { DividerProps, ChildItemPropsInMenu } from '../types';

export default class Divider extends Component<DividerProps> {
    static menuChildType = 'divider';

    render() {
        const { root, className, parentMode, parent, ...others } = this
            .props as ChildItemPropsInMenu<DividerProps>;
        const { prefix } = root.props;

        const newClassName = cx(`${prefix}menu-divider`, className);

        return <li role="separator" className={newClassName} {...others} />;
    }
}
