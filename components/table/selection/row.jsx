import React from 'react';
import classnames from 'classnames';
import Row from '../expanded/row';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class SelectionRow extends React.Component {
    static defaultProps = {
        ...Row.defaultProps,
    };

    static contextType = TableContext;

    getDOMNode() {
        return this.rowRef && this.rowRef.getDOMNode ? this.rowRef.getDOMNode() : this.rowRef;
    }

    render() {
        /* eslint-disable no-unused-vars*/
        const { className, record, primaryKey } = this.props;
        const { selectedRowKeys } = this.context || {};
        const cls = classnames({
            selected: selectedRowKeys.indexOf(record[primaryKey]) > -1,
            [className]: className,
        });
        return <Row ref={c => { this.rowRef = c; }} {...this.props} className={cls} />;
    }
}
