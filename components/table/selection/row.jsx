import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Row from '../expanded/row';
import TableContext from '../context';

/* eslint-disable react/prefer-stateless-function */
export default class SelectionRow extends React.Component {
    static propTypes = {
        ...Row.propTypes,
    };

    static defaultProps = {
        ...Row.defaultProps,
    };

    static contextType = TableContext;

    render() {
        /* eslint-disable no-unused-vars*/
        const { className, record, primaryKey } = this.props;
        const { selectedRowKeys } = this.context || {};
        const cls = classnames({
            selected: selectedRowKeys.indexOf(record[primaryKey]) > -1,
            [className]: className,
        });
        return <Row {...this.props} className={cls} />;
    }
}
