import React from 'react';
import { findDOMNode } from 'react-dom';
import FixedBody from '../fixed/body';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class LockBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getLockNode, lockType } = this.context || {};
        getLockNode && getLockNode('body', findDOMNode(this), lockType);
    }

    onBodyScroll = event => {
        const { onLockBodyScroll } = this.context || {};
        onLockBodyScroll && onLockBodyScroll(event);
    };

    render() {
        const event = {
            onLockScroll: this.onBodyScroll,
        };
        return <FixedBody {...this.props} {...event} />;
    }
}
