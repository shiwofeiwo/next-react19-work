import React from 'react';
import classnames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import type { TabItemProps, ItemProps } from '../types';

/** Tab.Item */
class TabItem extends React.Component<ItemProps> {
    static displayName = 'TabItem';
    static defaultProps = {
        prefix: 'next-',
        closeable: false,
    };

    _actived: boolean;
    readonly props: TabItemProps;

    render() {
        const { prefix, active, lazyLoad, unmountInactiveTabs, children } = this.props;

        this._actived = this._actived || active!;
        if (lazyLoad && !this._actived) {
            return null;
        }

        if (unmountInactiveTabs && !active) {
            return null;
        }

        const cls = classnames({
            [`${prefix}tabs-tabpane`]: true,
            [`${active ? 'active' : 'hidden'}`]: true,
        });

        return (
            <div role="tabpanel" aria-hidden={active ? 'false' : 'true'} className={cls}>
                {children}
            </div>
        );
    }
}

export default polyfill(TabItem);
