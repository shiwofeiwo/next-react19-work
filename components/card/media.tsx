import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import { log } from '../util';
import type { CardMediaProps } from './types';

const { warning } = log;

const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];

class CardMedia extends Component<CardMediaProps> {
    static displayName = 'CardMedia';
    static defaultProps = {
        prefix: 'next-',
        component: 'div',
        style: {},
    };

    render() {
        const { prefix, style, className, component, image, src, ...others } = this.props;
        const Component = component as React.ElementType;
        if (!('children' in others || Boolean(image || src))) {
            warning('either `children`, `image` or `src` prop must be specified.');
        }

        const isMediaComponent = MEDIA_COMPONENTS.indexOf(component as string) !== -1;
        const composedStyle =
            !isMediaComponent && image ? { backgroundImage: `url("${image}")`, ...style } : style;

        return (
            <Component
                {...others}
                style={composedStyle}
                className={classNames(`${prefix}card-media`, className)}
                src={isMediaComponent ? image || src : undefined}
            />
        );
    }
}

export default ConfigProvider.config(CardMedia);
