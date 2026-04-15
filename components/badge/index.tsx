import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import { obj } from '../util';
import Sup from './sup';
import type { BadgeProps } from './types';

export type { BadgeProps };

const BADGE_PROP_KEYS = [
    'prefix',
    'rtl',
    'className',
    'style',
    'children',
    'count',
    'showZero',
    'content',
    'overflowCount',
    'dot',
];

/**
 * Badge
 */
class Badge extends Component<BadgeProps> {
    static defaultProps = {
        prefix: 'next-',
        count: 0,
        showZero: false,
        overflowCount: 99,
        dot: false,
    };

    render() {
        const {
            prefix,
            dot,
            className,
            children,
            content,
            style,
            rtl,
            count: originCount,
            showZero,
            overflowCount: originOverflowCount,
        } = this.props;
        const count = parseInt(originCount as string, 10);
        const overflowCount = parseInt(originOverflowCount as string, 10);
        const others = obj.pickOthers(BADGE_PROP_KEYS, this.props);

        // 如果是数字，则添加默认的 title
        if (count || (count === 0 && showZero)) {
            others.title = others.title || `${count}`;
        }

        const classes = classNames(
            `${prefix}badge`,
            {
                [`${prefix}badge-not-a-wrapper`]: !children,
            },
            className
        );

        return (
            <span dir={rtl ? 'rtl' : undefined} className={classes} {...others}>
                {children}
                <Sup
                    {...{
                        prefix,
                        content,
                        count,
                        showZero,
                        overflowCount,
                        dot,
                        style,
                    }}
                />
            </span>
        );
    }
}

export default ConfigProvider.config(Badge);
