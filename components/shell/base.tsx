import React, { Component } from 'react';
import classnames from 'classnames';
import ConfigProvider from '../config-provider';
import NavContext from '../nav/context';
import type { BaseProps } from './types';

export default function Base(props: { componentName?: string }) {
    const { componentName } = props;
    class Shell extends Component<BaseProps> {
        static displayName = componentName;

        static _typeMark = `Shell_${componentName}`;

        static defaultProps = {
            prefix: 'next-',
            component: 'div',
            onCollapseChange: () => {},
            fixed: false,
        };

        render() {
            const {
                prefix,
                className,
                miniable,
                device,
                direction,
                children,
                collapse,
                triggerProps,
                onCollapseChange,
                component,
                align,
                fixed,
                ...others
            } = this.props;

            const Tag = component as React.ElementType;

            const cls = classnames({
                [`${prefix}shell-${componentName!.toLowerCase()}`]: true,
                [`${prefix}shell-collapse`]: !!collapse,
                [`${prefix}shell-mini`]: miniable,
                [`${prefix}shell-nav-${align}`]:
                    componentName === 'Navigation' && direction === 'hoz' && align,
                [className!]: !!className,
            });

            let newChildren = children;
            if (componentName === 'Content') {
                newChildren = <div className={`${prefix}shell-content-inner`}>{children}</div>;
            }

            if (componentName === 'Page') {
                return children;
            }

            return (
                <NavContext.Provider value={{ isCollapse: collapse }}>
                    <Tag className={cls} {...others}>
                        {newChildren}
                    </Tag>
                </NavContext.Provider>
            );
        }
    }

    return ConfigProvider.config(Shell);
}
