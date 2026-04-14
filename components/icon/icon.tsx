import * as React from 'react';
import * as PropTypes from 'prop-types';
import cx from 'classnames';
import { Component } from 'react';
import { obj } from '../util';
import type { IconProps } from './types';
import ConfigProvider from '../config-provider';

const ICON_PROP_KEYS = [
    // ConfigProvider keys
    'prefix',
    'locale',
    'defaultPropsConfig',
    'errorBoundary',
    'pure',
    'warning',
    'rtl',
    'device',
    'children',
    'popupContainer',
    // Icon-specific keys
    'type',
    'size',
    'className',
    'style',
];

/**
 * Icon
 */
class Icon extends Component<IconProps> {
    static propTypes = {
        ...ConfigProvider.propTypes,
        type: PropTypes.string,
        children: PropTypes.node,
        size: PropTypes.oneOfType([
            PropTypes.oneOf([
                'xxs',
                'xs',
                'small',
                'medium',
                'large',
                'xl',
                'xxl',
                'xxxl',
                'inherit',
            ]),
            PropTypes.number,
        ]),
        className: PropTypes.string,
        style: PropTypes.object,
    };

    static defaultProps = {
        prefix: 'next-',
        size: 'medium',
    };

    static displayName = 'Icon';

    static _typeMark = 'icon';

    render() {
        const { prefix, type, size, className, rtl, style, children } = this.props;
        const others = obj.pickOthers(ICON_PROP_KEYS, this.props);

        const classes = cx({
            [`${prefix}icon`]: true,
            [`${prefix}icon-${type}`]: !!type,
            [`${prefix}${size}`]: !!size && typeof size === 'string',
            [className!]: !!className,
        });

        if (
            rtl &&
            type &&
            [
                'arrow-left',
                'arrow-right',
                'arrow-double-left',
                'arrow-double-right',
                'switch',
                'sorting',
                'descending',
                'ascending',
            ].indexOf(type) !== -1
        ) {
            others.dir = 'rtl';
        }

        const sizeStyle =
            typeof size === 'number'
                ? {
                      width: size,
                      height: size,
                      lineHeight: `${size}px`,
                      fontSize: size,
                  }
                : {};

        return (
            <i {...others} style={{ ...sizeStyle, ...style }} className={classes}>
                {children}
            </i>
        );
    }
}

export default Icon;
