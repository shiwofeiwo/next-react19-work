import React from 'react';
import classNames from 'classnames';
import { func, obj } from '../util';
import Icon from '../icon';
import zhCN from '../locale/zh-cn';
import { normalMap, edgeMap } from './alignMap';
import type { BalloonInnerProps } from './types';
/**
 * Created by xiachi on 17/2/10.
 */

const { noop } = func;

const BALLOON_INNER_PROP_KEYS = [
    'prefix',
    'rtl',
    'closable',
    'children',
    'title',
    'className',
    'alignEdge',
    'onClose',
    'style',
    'align',
    'type',
    'isTooltip',
    'locale',
    'pure',
    'v2',
];

class BalloonInner extends React.Component<BalloonInnerProps> {
    static defaultProps = {
        prefix: 'next-',
        closable: true,
        onClose: noop,
        locale: zhCN.Balloon,
        align: 'b',
        type: 'normal',
        alignEdge: false,
        pure: false,
    };

    render() {
        const {
            prefix,
            closable,
            className,
            style,
            isTooltip,
            align,
            title,
            type,
            onClose,
            alignEdge,
            v2,
            children,
            rtl,
            locale,
            ...others
        } = this.props;

        const alignMap = alignEdge || v2 ? edgeMap : normalMap;
        let _prefix = prefix;

        if (isTooltip) {
            _prefix = `${_prefix}balloon-tooltip`;
        } else {
            _prefix = `${_prefix}balloon`;
        }

        const closableInTitle = closable && title !== undefined;
        const closableInContent = closable && title === undefined;

        const classes = classNames({
            [`${_prefix}`]: true,
            [`${_prefix}-${type}`]: type,
            [`${_prefix}-medium`]: true,
            [`${_prefix}-${alignMap[align!].arrow}`]: alignMap[align!],
            [`${_prefix}-closable`]: closableInContent,
            [className!]: className,
            [`${_prefix}-v2`]: v2,
        });

        const titleCls = classNames({
            [`${prefix}balloon-title`]: true,
            [`${_prefix}-closable`]: closableInTitle,
        });

        const closeIcon = (
            <a
                role="button"
                aria-label={locale.close}
                tabIndex={0}
                className={`${_prefix}-close`}
                onClick={onClose}
            >
                <Icon type="close" size="small" />
            </a>
        );

        return (
            <div
                role="tooltip"
                aria-live="polite"
                dir={rtl ? 'rtl' : undefined}
                className={classes}
                style={style}
                {...obj.pickOthers(BALLOON_INNER_PROP_KEYS, others)}
            >
                <div className={`${prefix}balloon-arrow`}>
                    <div className={`${prefix}balloon-arrow-content`} />
                </div>
                {title && (
                    <div className={titleCls}>
                        {title}
                        {closableInTitle && closeIcon}
                    </div>
                )}
                <div className={`${prefix}balloon-content`}>{children}</div>
                {closableInContent && closeIcon}
            </div>
        );
    }
}

export default BalloonInner;
