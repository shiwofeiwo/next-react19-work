import React from 'react';
import Header from './fixed/header';
import StickyHeader from './sticky/header';
import { statics } from './util';
import TableContext from './context';

export default function sticky(BaseComponent) {
    /** Table */
    class StickyTable extends React.Component {
        static StickyHeader = StickyHeader;
        static defaultProps = {
            components: {},
            ...BaseComponent.defaultProps,
        };

        static contextType = TableContext;

        state = {};

        render() {
            /* eslint-disable no-unused-vars */
            const { stickyHeader, offsetTop, affixProps, ...others } = this.props;
            let { components, maxBodyHeight, fixedHeader } = this.props;
            if (stickyHeader) {
                components = { ...components };
                components.Header = StickyHeader;
                fixedHeader = true;
                maxBodyHeight = Math.max(maxBodyHeight, 10000);
            }
            return (
                <TableContext.Provider
                    value={{
                        ...(this.context || {}),
                        Header: this.props.components.Header || Header,
                        offsetTop: this.props.offsetTop,
                        affixProps: this.props.affixProps,
                    }}
                >
                    <BaseComponent
                        {...others}
                        components={components}
                        fixedHeader={fixedHeader}
                        maxBodyHeight={maxBodyHeight}
                    />
                </TableContext.Provider>
            );
        }
    }
    statics(StickyTable, BaseComponent);
    return StickyTable;
}
