import React from 'react';
import cx from 'classnames';
import ConfigProvider from '../config-provider';
import { obj } from '../util';
import type { BoxProps } from './types';
import createStyle, {
    getMargin,
    getChildMargin,
    getSpacingHelperMargin,
    filterInnerStyle,
    filterHelperStyle,
    filterOuterStyle,
} from '../responsive-grid/create-style';

const { pickOthers } = obj;

type ChildElement = React.ReactElement<
    BoxProps,
    (string | React.JSXElementConstructor<BoxProps>) & { _typeMark: string }
>;
const createChildren = (children: React.ReactNode, { spacing, direction, wrap }: BoxProps) => {
    const array = React.Children.toArray(children);
    if (!children) {
        return null;
    }

    return array.map((child, index) => {
        let spacingMargin: { [key: string]: string | number } = {};

        spacingMargin = getChildMargin(spacing);

        if (!wrap) {
            // 不折行
            const isNone = [index === 0, index === array.length - 1];
            const props =
                direction === 'row' ? ['marginLeft', 'marginRight'] : ['marginTop', 'marginBottom'];

            ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
                if (prop in spacingMargin && props.indexOf(prop) === -1) {
                    spacingMargin[prop] = 0;
                }

                props.forEach((key, i) => {
                    if (key in spacingMargin && isNone[i]) {
                        spacingMargin[key] = 0;
                    }
                });
            });
        }

        if (React.isValidElement(child)) {
            const childEl = child as React.ReactElement<Record<string, any>>;
            const { margin: propsMargin } = childEl.props;
            const childPropsMargin = getMargin(propsMargin);
            let gridProps = {};
            if (
                ['function', 'object'].indexOf(typeof child.type) > -1 &&
                (child as ChildElement).type._typeMark === 'responsive_grid'
            ) {
                gridProps = createStyle({ display: 'grid', ...childEl.props });
            }

            return React.cloneElement(child as React.ReactElement<any>, {
                style: {
                    ...spacingMargin,
                    // ...getBoxChildProps(childEl.props),
                    ...childPropsMargin,
                    ...gridProps,
                    ...(childEl.props.style || {}),
                },
            });
        }

        return child;
    });
};

const getStyle = (style: React.CSSProperties | undefined, props: BoxProps) => {
    return {
        // @ts-expect-error fixme: wait responsive-grid refactor to ts
        ...createStyle({ display: 'flex', ...props }),
        ...style,
    };
};

const getOuterStyle: typeof getStyle = (style, styleProps) => {
    const sheet = getStyle(style, styleProps);

    return filterOuterStyle(sheet);
};

const getHelperStyle: typeof getStyle = (style, styleProps) => {
    const sheet = getStyle(style, styleProps);

    return filterHelperStyle({
        ...sheet,
        ...getSpacingHelperMargin(styleProps.spacing),
    });
};

const getInnerStyle: typeof getStyle = (style, styleProps) => {
    const sheet = getStyle(style, styleProps);

    return filterInnerStyle(sheet);
};

/**
 * Box
 */
const BOX_PROP_KEYS = [
    'prefix',
    'style',
    'className',
    'flex',
    'direction',
    'wrap',
    'spacing',
    'margin',
    'padding',
    'justify',
    'align',
    'device',
    'component',
];

class Box extends React.Component<BoxProps> {
    static defaultProps = {
        prefix: 'next-',
        direction: 'column',
        wrap: false,
        component: 'div',
    };

    render() {
        const {
            prefix,
            direction,
            justify,
            align,
            wrap,
            flex,
            spacing,
            padding,
            margin,
            style,
            className,
            children,
            device,
            component,
        } = this.props;

        const styleProps = {
            direction,
            justify,
            align,
            wrap,
            flex,
            spacing,
            padding,
            margin,
        };
        const View = component!;

        const others = pickOthers(BOX_PROP_KEYS, this.props);
        const styleSheet = getStyle(style, styleProps);

        const boxs = createChildren(children, {
            spacing,
            direction,
            wrap,
            device,
        });

        const cls = cx(
            {
                [`${prefix}box`]: true,
            },
            className
        );
        if (wrap && spacing) {
            const outerStyle = getOuterStyle(style, styleProps);
            const helperStyle = getHelperStyle(style, styleProps);
            const innerStyle = getInnerStyle(style, styleProps);

            return (
                <View style={outerStyle} className={cls} {...others}>
                    <div style={helperStyle}>
                        <div style={innerStyle} className={`${prefix}box`}>
                            {boxs}
                        </div>
                    </div>
                </View>
            );
        }

        return (
            <View style={styleSheet} className={cls} {...others}>
                {boxs}
            </View>
        );
    }
}
export type { BoxProps };
export default ConfigProvider.config(Box);
