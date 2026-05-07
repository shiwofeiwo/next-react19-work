import React from 'react';
import classnames from 'classnames';
import Row from '../selection/row';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class TreeRow extends React.Component {
    static defaultProps = {
        ...Row.defaultProps,
    };

    static contextType = TableContext;

    getDOMNode() {
        return this.rowRef && this.rowRef.getDOMNode ? this.rowRef.getDOMNode() : this.rowRef;
    }

    render() {
        /* eslint-disable no-unused-vars*/
        const { className, record, primaryKey, prefix, ...others } = this.props;
        const { treeStatus, openRowKeys } = this.context || {};
        const cls = classnames({
            hidden: !(treeStatus.indexOf(record[primaryKey]) > -1) && record.__level !== 0,
            [`${prefix}table-row-level-${record.__level}`]: true,
            opened: openRowKeys.indexOf(record[primaryKey]) > -1,
            [className]: className,
        });
        return <Row ref={c => { this.rowRef = c; }} {...others} record={record} className={cls} primaryKey={primaryKey} prefix={prefix} />;
    }
}
