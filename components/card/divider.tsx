import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import type { CardDividerProps } from './types';

class CardDivider extends Component<CardDividerProps> {
    static displayName = 'CardDivider';
    static defaultProps = {
        prefix: 'next-',
        component: 'hr',
    };

    render() {
        const { prefix, component, inset, className, ...others } = this.props;
        const Component = component as React.ElementType;
        const dividerClassName = classNames(
            `${prefix}card-divider`,
            {
                [`${prefix}card-divider--inset`]: inset,
            },
            className
        );

        return <Component {...others} className={dividerClassName} />;
    }
}

export default ConfigProvider.config(CardDivider);
