import React, { PureComponent, type ReactNode, type ReactElement } from 'react';
import classnames from 'classnames';
import type { TabContentProps } from '../types';

class TabContent extends PureComponent<TabContentProps> {
    static displayName = 'TabContent';
    render() {
        const { prefix, activeKey, lazyLoad, unmountInactiveTabs, children, className, ...others } =
            this.props;
        const formatChildren: ReactNode[] = [];
        React.Children.forEach(children, child => {
            const active = activeKey === (child as ReactElement<any>).key;
            formatChildren.push(
                React.cloneElement(child as ReactElement<any>, {
                    prefix,
                    active,
                    lazyLoad,
                    unmountInactiveTabs,
                })
            );
        });

        const classNames = classnames(
            {
                [`${prefix}tabs-content`]: true,
            },
            className
        );

        return (
            <div {...others} className={classNames}>
                {formatChildren}
            </div>
        );
    }
}

export default TabContent;
