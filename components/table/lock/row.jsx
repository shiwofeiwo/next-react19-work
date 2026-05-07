import React from 'react';
import Row from '../base/row';
import TableContext from '../context';

export default class LockRow extends React.Component {
    static contextType = TableContext;

    static defaultProps = {
        ...Row.defaultProps,
    };

    getDOMNode() {
        return this.rowRef && this.rowRef.getDOMNode ? this.rowRef.getDOMNode() : this.rowRef;
    }

    onMouseEnter = (record, index, e) => {
        const { onRowMouseEnter } = this.context || {};
        const { onMouseEnter } = this.props;
        onRowMouseEnter && onRowMouseEnter(record, index, e);
        onMouseEnter(record, index, e);
    };

    onMouseLeave = (record, index, e) => {
        const { onRowMouseLeave } = this.context || {};
        const { onMouseLeave } = this.props;
        onRowMouseLeave && onRowMouseLeave(record, index, e);
        onMouseLeave(record, index, e);
    };

    render() {
        /* eslint-disable no-unused-vars*/
        return <Row ref={c => { this.rowRef = c; }} {...this.props} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} />;
    }
}
