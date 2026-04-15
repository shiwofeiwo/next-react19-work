import React from 'react';
import FixedBody from '../fixed/body';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class LockBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getLockNode, lockType } = this.context || {};
        const node = this.fixedBodyRef && this.fixedBodyRef.getDOMNode();
        getLockNode && getLockNode('body', node, lockType);
    }

    onBodyScroll = event => {
        const { onLockBodyScroll } = this.context || {};
        onLockBodyScroll && onLockBodyScroll(event);
    };

    render() {
        const event = {
            onLockScroll: this.onBodyScroll,
        };
        return <FixedBody ref={c => { this.fixedBodyRef = c; }} {...this.props} {...event} />;
    }
}
