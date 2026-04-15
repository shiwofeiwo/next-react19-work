import React, { Component } from 'react';
import classNames from 'classnames';
import Loading from '../loading';
import zhCN from '../locale/zh-cn';
import ConfigProvider from '../config-provider';
import type { ListProps } from './types';

/**
 * List
 */
class List extends Component<ListProps> {
    static defaultProps = {
        rtl: false,
        size: 'medium',
        divider: true,
        prefix: 'next-',
        locale: zhCN.List,
        renderItem: (item: object) => item,
        loading: false,
    };

    static displayName = 'List';

    render() {
        const {
            prefix,
            header,
            footer,
            size,
            divider,
            className,
            children,
            rtl,
            dataSource,
            renderItem,
            locale,
            loading,
            loadingComponent: LoadingComponent = Loading,
            emptyContent,
            ...others
        } = this.props;

        if (rtl) {
            others.dir = 'rtl';
        }

        const dSValid = Array.isArray(dataSource);

        const classes = classNames(
            `${prefix}list`,
            {
                [`${prefix}list-${size}`]: size,
                [`${prefix}list-divider`]: divider,
            },
            className
        );

        const customContent =
            dSValid &&
            renderItem &&
            dataSource.map((one, index) => {
                return renderItem(one, index);
            });

        const content = (
            <div {...others} className={classes}>
                {header ? <div className={`${prefix}list-header`}>{header}</div> : null}

                {!(dSValid && dataSource.length > 0) && !children ? (
                    <div className={`${prefix}list-empty`}>
                        {emptyContent || (locale?.empty as React.ReactNode)}
                    </div>
                ) : (
                    <ul key="list-body" className={`${prefix}list-items`}>
                        {customContent}
                        {children}
                    </ul>
                )}

                {footer ? <div className={`${prefix}list-footer`}>{footer}</div> : null}
            </div>
        );

        if (loading) {
            const loadingClassName = `${prefix}list-loading`;
            return <LoadingComponent className={loadingClassName}>{content}</LoadingComponent>;
        }

        return content;
    }
}

export default ConfigProvider.config(List);
