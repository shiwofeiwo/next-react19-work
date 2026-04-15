import React from 'react';
import BodyComponent from '../base/body';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class VirtualBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode, getBodyNode, getLockNode, lockType } = this.context || {};
        const bodyNode = this.containerRef;
        // for fixed
        getNode && getNode('body', bodyNode);
        // for virtual
        getBodyNode && getBodyNode(bodyNode, lockType);
        // for lock
        getLockNode && getLockNode('body', bodyNode, lockType);
    }

    tableRef = table => {
        this.tableNode = table;
    };

    virtualScrollRef = virtualScroll => {
        this.virtualScrollNode = virtualScroll;
    };

    onScroll = current => {
        const { onFixedScrollSync, onLockBodyScroll, onVirtualScroll } = this.context || {};
        // for fixed
        onFixedScrollSync && onFixedScrollSync(current);
        // for lock
        onLockBodyScroll && onLockBodyScroll(current);
        // for virtual
        onVirtualScroll && onVirtualScroll();
    };

    render() {
        const { prefix, className, colGroup, tableWidth, ...others } = this.props;
        const { maxBodyHeight, bodyHeight, innerTop } = this.context || {};
        const style = {
            width: tableWidth,
        };
        const wrapperStyle = {
            position: 'relative',
        };
        // todo 2.0 ，这里最好自己画滚动条
        if (bodyHeight > maxBodyHeight) {
            wrapperStyle.height = bodyHeight;
        }
        return (
            <div ref={c => { this.containerRef = c; }} style={{ maxHeight: maxBodyHeight }} className={className} onScroll={this.onScroll}>
                <div style={wrapperStyle} ref={this.virtualScrollRef}>
                    <div
                        style={{
                            position: 'relative',
                            transform: `translateY(${innerTop}px)`,
                            willChange: 'transform',
                        }}
                    >
                        <table ref={this.tableRef} style={style}>
                            {colGroup}
                            <BodyComponent {...others} prefix={prefix} />
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
