import React, { Component, type ComponentClass, type FunctionComponent } from 'react';
import cx from 'classnames';
import ConfigProvider from '../config-provider';
import { type ColProps, type BreakPoints, type PointProps, type TypeRecord } from './types';
import { obj } from '../util';

const breakPoints: BreakPoints[] = ['xxs', 'xs', 's', 'm', 'l', 'xl'];

type BooleanRecord = TypeRecord<boolean>;

const COL_PROP_KEYS = [
    'prefix',
    'pure',
    'rtl',
    'className',
    'style',
    'children',
    'span',
    'fixedSpan',
    'offset',
    'fixedOffset',
    'align',
    'hidden',
    'xxs',
    'xs',
    's',
    'm',
    'l',
    'xl',
    'component',
    // ConfigProvider 通用 props —— 不应泄漏到 DOM 属性
    'device',
    'locale',
    'popupContainer',
    'errorBoundary',
    'defaultPropsConfig',
];

/**
 * Grid.Col
 * @order 2
 */
export default class Col extends Component<ColProps> {
    static isNextCol = true;

    static defaultProps = {
        prefix: 'next-',
        pure: false,
        component: 'div',
    };

    render() {
        const {
            prefix,
            pure,
            span,
            offset,
            fixedSpan,
            fixedOffset,
            hidden,
            align,
            xxs,
            xs,
            s,
            m,
            l,
            xl,
            component,
            className,
            children,
            rtl,
            style,
            ...others
        } = this.props;
        const domOtherProps = obj.pickOthers(COL_PROP_KEYS, others);
        const Tag = component as
            | string
            | FunctionComponent<Record<string, unknown> & { className: string }>
            | ComponentClass<Record<string, unknown> & { className: string }>;
        const pointClassObj = breakPoints.reduce((ret, point) => {
            let pointProps = {} as PointProps;
            const pointValue = this.props[point];
            if (typeof pointValue === 'object' && pointValue !== null) {
                pointProps = pointValue;
            } else {
                pointProps.span = pointValue;
            }

            ret[`${prefix}col-${point}-${pointProps.span}`] = !!pointProps.span;
            ret[`${prefix}col-${point}-offset-${pointProps.offset}`] = !!pointProps.offset;

            return ret;
        }, {} as BooleanRecord);

        let hiddenClassObj = {} as BooleanRecord;
        if (hidden === true) {
            hiddenClassObj = { [`${prefix}col-hidden`]: true };
        } else if (typeof hidden === 'string') {
            hiddenClassObj = { [`${prefix}col-${hidden}-hidden`]: !!hidden };
        } else if (Array.isArray(hidden)) {
            hiddenClassObj = hidden.reduce((ret, point) => {
                ret[`${prefix}col-${point}-hidden`] = !!point;
                return ret;
            }, {} as BooleanRecord);
        }

        const classes = cx({
            [`${prefix}col`]: true,
            [`${prefix}col-${span}`]: !!span,
            [`${prefix}col-fixed-${fixedSpan}`]: !!fixedSpan,
            [`${prefix}col-offset-${offset}`]: !!offset,
            [`${prefix}col-offset-fixed-${fixedOffset}`]: !!fixedOffset,
            [`${prefix}col-${align}`]: !!align,
            ...pointClassObj,
            ...hiddenClassObj,
            [className!]: !!className,
        });

        return (
            <Tag
                dir={rtl ? 'rtl' : 'ltr'}
                role="gridcell"
                className={classes}
                style={style}
                {...domOtherProps}
            >
                {children}
            </Tag>
        );
    }
}
