import React from 'react';
import Row from '../base/row';
import TableContext from '../context';

export default class LockRow extends React.Component {
    static contextType = TableContext;

    static defaultProps = {
        ...Row.defaultProps,
    };

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
        return <Row {...this.props} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} />;
    }
}
