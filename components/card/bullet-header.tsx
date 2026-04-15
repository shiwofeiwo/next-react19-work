import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigProvider from '../config-provider';
import type { CardBulletHeaderProps } from './types';

class CardBulletHeader extends Component<CardBulletHeaderProps> {
    static displayName = 'CardBulletHeader';
    static defaultProps = {
        prefix: 'next-',
        showTitleBullet: true,
    };

    render() {
        const { prefix, title, subTitle, extra, showTitleBullet } = this.props;

        if (!title) return null;

        const headCls = classNames({
            [`${prefix}card-head`]: true,
            [`${prefix}card-head-show-bullet`]: showTitleBullet,
        });

        const headExtra = extra ? <div className={`${prefix}card-extra`}>{extra}</div> : null;

        return (
            <div className={headCls}>
                <div className={`${prefix}card-head-main`}>
                    <div className={`${prefix}card-title`}>
                        {title}
                        {subTitle ? (
                            <span className={`${prefix}card-subtitle`}>{subTitle}</span>
                        ) : null}
                    </div>
                    {headExtra}
                </div>
            </div>
        );
    }
}

export default ConfigProvider.config(CardBulletHeader, {
    componentName: 'Card',
});
