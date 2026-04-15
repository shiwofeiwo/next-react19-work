import React, { Component, Children } from 'react';
import classNames from 'classnames';
import { GroupProps } from '../types';
import ConfigProvider from '../../config-provider';

/**
 * Button.Group
 */
class ButtonGroup extends Component<GroupProps> {
    static displayName = 'ButtonGroup';
    static defaultProps = {
        prefix: 'next-',
        size: 'medium',
    };

    render() {
        const { prefix, className, size, children, rtl, ...others } = this.props;

        const groupCls = classNames({
            [`${prefix}btn-group`]: true,
            [className!]: className,
        });

        const cloneChildren = Children.map(children, child => {
            if (child) {
                // fixme: child may not be cloned
                return React.cloneElement(child as React.ReactElement<any>, {
                    size: size,
                });
            }
        });

        if (rtl) {
            others.dir = 'rtl';
        }

        return (
            <div {...others} className={groupCls}>
                {cloneChildren}
            </div>
        );
    }
}

export type { ButtonGroup };

export default ConfigProvider.config(ButtonGroup);
