import React, { Component } from 'react';
import Line from './progress-line';
import Circle from './progress-circle';
import type { ProgressProps } from '../types';
import { type ClassPropsWithDefault } from '../../util';

export type ProgressWithDefaultProps = ClassPropsWithDefault<
    ProgressProps,
    typeof Progress.defaultProps
>;
/**
 * Progress
 */
export default class Progress extends Component<ProgressProps> {
    static defaultProps = {
        prefix: 'next-',
        shape: 'line',
        state: 'normal',
        size: 'medium',
        percent: 0,
        progressive: false,
        hasBorder: false,
        textRender: (percent: number) => `${Math.floor(percent)}%`,
    };

    static displayName = 'Progress';

    readonly props: ProgressWithDefaultProps;
    render() {
        const { shape, hasBorder, ...others } = this.props;
        return shape === 'circle' ? (
            <Circle {...others} />
        ) : (
            <Line {...others} hasBorder={hasBorder} />
        );
    }
}
