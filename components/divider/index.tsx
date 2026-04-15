import React, { Component } from 'react';
import classNames from 'classnames';
import { obj } from '../util';
import type { DividerProps } from './types';
import ConfigProvider from '../config-provider';

/**
 * Divider
 */
const DIVIDER_PROP_KEYS = ['prefix', 'children', 'className', 'dashed', 'direction', 'orientation'];

class Divider extends Component<DividerProps> {
    static defaultProps = {
        prefix: 'next-',
        direction: 'hoz',
        orientation: 'center',
        dashed: false,
    };

    render() {
        const { prefix, className, dashed, direction, orientation, children } = this.props;
        const others = obj.pickOthers(DIVIDER_PROP_KEYS, this.props);

        const cls = classNames(
            {
                [`${prefix}divider`]: true,
                [`${prefix}divider-dashed`]: !!dashed,
                [`${prefix}divider-${direction}`]: !!direction,
                [`${prefix}divider-with-text-${orientation}`]: !!orientation && children,
            },
            className
        );

        return (
            <div role="separator" className={cls} {...others}>
                {children && <span className={`${prefix}divider-inner-text`}>{children}</span>}
            </div>
        );
    }
}

export type { DividerProps };
export default ConfigProvider.config(Divider);
