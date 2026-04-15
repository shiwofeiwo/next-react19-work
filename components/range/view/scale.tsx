import classNames from 'classnames';
import React from 'react';
import { inRange, getPercent } from '../utils';
import type { RangeScaleProps } from '../types';

export default class Scale extends React.Component<RangeScaleProps> {
    static displayName = 'Scale';
    static defaultProps = {
        prefix: 'next-',
        min: 0,
        max: 100,
        value: 0,
        rtl: false,
    };

    _renderItems() {
        const { min, max, value, prefix, scales, rtl } = this.props;
        const items: React.ReactNode[] = [];

        scales.forEach((scale, i) => {
            const classes = classNames({
                [`${prefix}range-scale-item`]: true,
                activated: inRange(scale, value, min),
            });
            let style;
            if (rtl) {
                style = {
                    right: `${getPercent(min, max, scale)}%`,
                    left: 'auto',
                };
            } else {
                style = {
                    left: `${getPercent(min, max, scale)}%`,
                    right: 'auto',
                };
            }

            items.push(
                // "key" is for https://fb.me/react-warning-keys
                <span className={classes} style={style} key={i} />
            );
        });

        return items;
    }

    render() {
        const { prefix } = this.props;
        const classes = classNames({
            [`${prefix}range-scale`]: true,
        });
        const items = this._renderItems();

        return <div className={classes}>{items}</div>;
    }
}
