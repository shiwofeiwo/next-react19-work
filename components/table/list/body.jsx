import React from 'react';
import { findDOMNode } from 'react-dom';
import BodyComponent from '../base/body';
import TableContext from '../context';

export default class ListBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode } = this.context || {};
        getNode && getNode('body', findDOMNode(this));
    }

    onScroll = e => {
        const { onFixedScrollSync } = this.context || {};
        onFixedScrollSync && onFixedScrollSync(e);
    };

    render() {
        return <BodyComponent component="div" onScroll={this.onScroll} {...this.props} />;
    }
}
