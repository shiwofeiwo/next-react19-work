import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import type { ListItemProps } from './types';

/**
 * List.Item
 */
class ListItem extends Component<ListItemProps> {
    static defaultProps = {
        prefix: 'next-',
    };

    render() {
        const { prefix, title, description, media, extra, className, children, ...others } =
            this.props;

        const classes = classNames(`${prefix}list-item`, className);

        return (
            <li {...others} className={classes}>
                {media ? <div className={`${prefix}list-item-media`}>{media}</div> : null}
                <div className={`${prefix}list-item-content`}>
                    {title ? <div className={`${prefix}list-item-title`}>{title}</div> : null}
                    {description ? (
                        <div className={`${prefix}list-item-description`}>{description}</div>
                    ) : null}
                    {children}
                </div>
                {extra ? <div className={`${prefix}list-item-extra`}>{extra}</div> : null}
            </li>
        );
    }
}

export type { ListItem };

export default ConfigProvider.config(ListItem);
