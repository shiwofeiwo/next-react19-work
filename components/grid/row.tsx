import React, {
    Component,
    Children,
    cloneElement,
    type ReactElement,
    type FunctionComponent,
    type ComponentClass,
} from 'react';
import cx from 'classnames';
import ConfigProvider from '../config-provider';
import { type RowProps, type TypeRecord } from './types';
import type Col from './col';
import { obj } from '../util';

type BooleanRecord = TypeRecord<boolean>;

const ROW_PROP_KEYS = [
    'prefix',
    'pure',
    'rtl',
    'className',
    'style',
    'children',
    'gutter',
    'wrap',
    'fixed',
    'fixedWidth',
    'align',
    'justify',
    'hidden',
    'component',
    // ConfigProvider 通用 props —— 不应泄漏到 DOM 属性
    'device',
    'locale',
    'popupContainer',
    'errorBoundary',
    'defaultPropsConfig',
];

/**
 * Grid.Row
 * @order 1
 */
export default class Row extends Component<RowProps> {
    static defaultProps = {
        prefix: 'next-',
        pure: false,
        fixed: false,
        gutter: 0,
        wrap: false,
        component: 'div',
    };

    render() {
        /* eslint-disable no-unused-vars */
        const {
            prefix,
            pure,
            wrap,
            fixed,
            gutter,
            fixedWidth,
            align,
            justify,
            hidden,
            className,
            style,
            component,
            children,
            rtl,
            ...others
        } = this.props;
        const domOtherProps = obj.pickOthers(ROW_PROP_KEYS, others);
        const Tag = component as
            | string
            | FunctionComponent<Record<string, unknown> & { className: string }>
            | ComponentClass<Record<string, unknown> & { className: string }>;

        let hiddenClassObj = {} as BooleanRecord;
        if (hidden === true) {
            hiddenClassObj = { [`${prefix}row-hidden`]: true };
        } else if (typeof hidden === 'string') {
            hiddenClassObj = { [`${prefix}row-${hidden}-hidden`]: !!hidden };
        } else if (Array.isArray(hidden)) {
            hiddenClassObj = hidden.reduce((ret, point) => {
                ret[`${prefix}row-${point}-hidden`] = !!point;
                return ret;
            }, {} as BooleanRecord);
        }

        const newClassName = cx({
            [`${prefix}row`]: true,
            [`${prefix}row-wrap`]: wrap,
            [`${prefix}row-fixed`]: fixed,
            [`${prefix}row-fixed-${fixedWidth}`]: !!fixedWidth,
            [`${prefix}row-justify-${justify}`]: !!justify,
            [`${prefix}row-align-${align}`]: !!align,
            ...hiddenClassObj,
            [className!]: !!className,
        });

        let newChildren = children;
        let newStyle = style;
        const gutterNumber = parseInt((gutter as string).toString(), 10);
        if (gutterNumber !== 0) {
            const halfGutterString = `${gutterNumber / 2}px`;
            newStyle = {
                marginLeft: `-${halfGutterString}`,
                marginRight: `-${halfGutterString}`,
                ...newStyle,
            };
            newChildren = Children.map(children, (child: ReactElement<any>) => {
                if (
                    child &&
                    child.type &&
                    typeof child.type === 'function' &&
                    (child.type as unknown as typeof Col).isNextCol
                ) {
                    const newChild = cloneElement(child, {
                        style: {
                            paddingLeft: halfGutterString,
                            paddingRight: halfGutterString,
                            ...(child.props.style || {}),
                        },
                    });
                    return newChild;
                }

                return child;
            });
        }

        return (
            <Tag
                dir={rtl ? 'rtl' : 'ltr'}
                role="row"
                className={newClassName}
                style={newStyle}
                {...domOtherProps}
            >
                {newChildren}
            </Tag>
        );
    }
}
