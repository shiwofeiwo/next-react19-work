import React from 'react';
import BodyComponent from '../base/body';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class FixedBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode } = this.context || {};
        getNode && getNode('body', this.containerRef);
    }

    getDOMNode() {
        return this.containerRef;
    }

    onBodyScroll = event => {
        const { onFixedScrollSync } = this.context || {};
        // sync scroll left to header
        onFixedScrollSync && onFixedScrollSync(event);

        // sync scroll top/left to lock columns
        if ('onLockScroll' in this.props && typeof this.props.onLockScroll === 'function') {
            this.props.onLockScroll(event);
        }
    };

    render() {
        /*eslint-disable no-unused-vars */
        const { className, colGroup, onLockScroll, tableWidth, ...others } = this.props;
        const { maxBodyHeight, fixedHeader } = this.context || {};
        const style = {};
        if (fixedHeader) {
            style.maxHeight = maxBodyHeight;
            style.position = 'relative';
        }
        return (
            <div ref={c => { this.containerRef = c; }} style={style} className={className} onScroll={this.onBodyScroll}>
                <table style={{ width: tableWidth }}>
                    {colGroup}
                    <BodyComponent {...others} colGroup={colGroup} />
                </table>
            </div>
        );
    }
}
