import React from 'react';
import BodyComponent from '../base/body';
import TableContext from '../context';

export default class ListBody extends React.Component {
    static contextType = TableContext;

    componentDidMount() {
        const { getNode } = this.context || {};
        const node = this.bodyRef && this.bodyRef.getDOMNode();
        getNode && getNode('body', node);
    }

    onScroll = e => {
        const { onFixedScrollSync } = this.context || {};
        onFixedScrollSync && onFixedScrollSync(e);
    };

    render() {
        return <BodyComponent ref={c => { this.bodyRef = c; }} component="div" onScroll={this.onScroll} {...this.props} />;
    }
}
